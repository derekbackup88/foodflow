import { createClient } from '@supabase/supabase-js';

// NOTA: Esta função foi projetada para rodar em um ambiente Node.js 
// (ex: Supabase Edge Functions, AWS Lambda ou servidor Express).
// Ela NÃO deve ser executada diretamente no browser por questões de segurança (Service Role Key).

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface WebhookPayload {
  type: 'UPDATE';
  table: 'orders';
  record: {
    id: string;
    status: string;
    total_amount: number;
    table_id: string;
  };
  old_record: {
    status: string;
  };
}

export async function handleOrderCompletion(payload: WebhookPayload) {
  const { record, old_record } = payload;

  // 1. Verificar se o status mudou para COMPLETED
  if (record.status === 'COMPLETED' && old_record.status !== 'COMPLETED') {
    console.log(`Processando finalização do pedido: ${record.id}`);
    
    try {
      // 2. Buscar itens do pedido e suas receitas
      // Precisamos dos order_items -> menu_items -> recipes -> ingredients
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          quantity,
          menu_items (
            name,
            recipes (
              quantity_required,
              ingredient_id
            )
          )
        `)
        .eq('order_id', record.id);

      if (itemsError) throw itemsError;

      if (!orderItems) return;

      // 3. Calcular consumo total de ingredientes
      const ingredientUsage: Record<string, number> = {};

      orderItems.forEach((item: any) => {
        const itemQty = item.quantity;
        const recipes = item.menu_items?.recipes || [];

        recipes.forEach((recipe: any) => {
            const totalRequired = recipe.quantity_required * itemQty;
            if (ingredientUsage[recipe.ingredient_id]) {
                ingredientUsage[recipe.ingredient_id] += totalRequired;
            } else {
                ingredientUsage[recipe.ingredient_id] = totalRequired;
            }
        });
      });

      // 4. Atualizar Estoque e Gerar Alertas
      // (Idealmente, isso seria feito via RPC no Postgres para atomicidade, mas aqui está a lógica em Node)
      for (const [ingredientId, amountUsed] of Object.entries(ingredientUsage)) {
          // Buscar ingrediente atual
          const { data: ingredient } = await supabase
            .from('ingredients')
            .select('*')
            .eq('id', ingredientId)
            .single();

          if (ingredient) {
              const newStock = ingredient.current_stock - amountUsed;

              // Atualizar banco
              await supabase
                .from('ingredients')
                .update({ current_stock: newStock })
                .eq('id', ingredientId);

              // 5. Verificar nível crítico
              if (newStock <= ingredient.min_stock_level) {
                  await supabase
                    .from('alerts')
                    .insert({
                        message: `ALERTA: Estoque crítico para ${ingredient.name}. Atual: ${newStock} ${ingredient.unit}`,
                        type: 'LOW_STOCK'
                    });
                  console.log(`Alerta gerado para ${ingredient.name}`);
              }
          }
      }

      // 6. Registrar Transação Financeira
      await supabase
        .from('financial_transactions')
        .insert({
            order_id: record.id,
            type: 'REVENUE',
            amount: record.total_amount,
            description: `Receita referente ao Pedido da Mesa (ID: ${record.table_id})`
        });

      console.log('Transação financeira registrada e estoque atualizado.');

    } catch (err) {
      console.error('Erro ao processar pedido:', err);
    }
  }
}