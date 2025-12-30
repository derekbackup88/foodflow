import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { CATEGORIES } from '../constants';
import { PreparationSector, MenuItem } from '../types';
import { PlusCircle, Trash2, Tag, DollarSign, FileText, LayoutGrid, ClipboardList, Save, X } from 'lucide-react';

// Modal de Ficha Técnica
const RecipeModal: React.FC<{
  item: MenuItem;
  onClose: () => void;
}> = ({ item, onClose }) => {
  const { ingredients, recipes, updateRecipe } = useRestaurant();
  
  // Carrega receita atual do item
  const currentRecipe = recipes.filter(r => r.menuItemId === item.id);
  
  // Estado local para edição
  const [recipeItems, setRecipeItems] = useState<{ingredientId: string, quantity: number}[]>(
    currentRecipe.map(r => ({ ingredientId: r.ingredientId, quantity: r.quantityRequired }))
  );
  
  const [selectedIngredient, setSelectedIngredient] = useState(ingredients[0]?.id || '');
  const [quantity, setQuantity] = useState('');

  const handleAddIngredient = () => {
    if (!selectedIngredient || !quantity) return;
    
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) return;

    // Evita duplicatas, soma se já existir
    setRecipeItems(prev => {
      const exists = prev.find(i => i.ingredientId === selectedIngredient);
      if (exists) {
        return prev.map(i => i.ingredientId === selectedIngredient ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, { ingredientId: selectedIngredient, quantity: qty }];
    });
    setQuantity('');
  };

  const handleRemoveIngredient = (ingId: string) => {
    setRecipeItems(prev => prev.filter(i => i.ingredientId !== ingId));
  };

  const handleSave = () => {
    updateRecipe(item.id, recipeItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
           <div>
             <h3 className="font-bold text-lg text-neutral-800">Ficha Técnica</h3>
             <p className="text-sm text-neutral-500">{item.name}</p>
           </div>
           <button onClick={onClose}><X size={20} className="text-neutral-400 hover:text-neutral-800" /></button>
        </div>

        <div className="p-6 space-y-6">
           {/* Adicionar Insumo */}
           <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 space-y-3">
              <label className="text-xs font-bold text-orange-800 uppercase">Adicionar Insumo</label>
              <div className="flex gap-2">
                 <select 
                   value={selectedIngredient}
                   onChange={e => setSelectedIngredient(e.target.value)}
                   className="flex-1 px-3 py-2 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                   disabled={ingredients.length === 0}
                 >
                    {ingredients.length === 0 && <option>Nenhum ingrediente cadastrado</option>}
                    {ingredients.map(ing => (
                      <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                    ))}
                 </select>
                 <input 
                    type="number"
                    placeholder="Qtd"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className="w-20 px-3 py-2 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                 />
                 <button 
                    onClick={handleAddIngredient}
                    disabled={ingredients.length === 0}
                    className="bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                 >
                    <PlusCircle size={20} />
                 </button>
              </div>
           </div>

           {/* Lista de Insumos da Receita */}
           <div>
              <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">Composição do Prato</label>
              <div className="border border-neutral-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                {recipeItems.length === 0 ? (
                  <div className="p-4 text-center text-neutral-400 text-sm">Nenhum insumo vinculado.</div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-4 py-2 text-neutral-600 font-medium">Insumo</th>
                        <th className="px-4 py-2 text-neutral-600 font-medium">Qtd</th>
                        <th className="px-4 py-2 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {recipeItems.map(ri => {
                        const ing = ingredients.find(i => i.id === ri.ingredientId);
                        return (
                          <tr key={ri.ingredientId}>
                            <td className="px-4 py-2 text-neutral-800">{ing?.name || 'Item removido'}</td>
                            <td className="px-4 py-2 text-neutral-600 font-mono">{ri.quantity} {ing?.unit}</td>
                            <td className="px-4 py-2 text-right">
                              <button onClick={() => handleRemoveIngredient(ri.ingredientId)} className="text-red-500 hover:text-red-700">
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
           </div>
        </div>

        <div className="p-6 border-t border-neutral-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-neutral-600 font-medium hover:bg-neutral-100 rounded-lg">Cancelar</button>
          <button onClick={handleSave} className="px-4 py-2 bg-neutral-900 text-white font-bold rounded-lg hover:bg-black shadow-lg">Salvar Receita</button>
        </div>
      </div>
    </div>
  );
};

export const MenuManagement: React.FC = () => {
  const { menu, addMenuItem, removeMenuItem, recipes } = useRestaurant();
  
  // Form States
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [sector, setSector] = useState<PreparationSector>(PreparationSector.KITCHEN);
  
  // Recipe Modal State
  const [editingRecipeItem, setEditingRecipeItem] = useState<MenuItem | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    addMenuItem({
      name,
      description,
      price: parseFloat(price),
      categoryId: category,
      preparationSector: sector
    });

    // Reset Form
    setName('');
    setDescription('');
    setPrice('');
  };

  const getSectorLabel = (s: PreparationSector) => {
    switch (s) {
      case PreparationSector.KITCHEN: return 'Cozinha';
      case PreparationSector.GRILL: return 'Churrasqueira';
      case PreparationSector.BAR: return 'Bar/Copa';
      case PreparationSector.DESSERT: return 'Confeitaria';
      default: return s;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Lista de Itens */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Cardápio Atual</h2>
          <p className="text-neutral-500">Gerencie os pratos e bebidas disponíveis para venda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menu.map(item => {
            const catName = CATEGORIES.find(c => c.id === item.categoryId)?.name;
            const hasRecipe = recipes.some(r => r.menuItemId === item.id);
            
            return (
              <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-neutral-200 group hover:border-orange-300 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-lg text-neutral-800">{item.name}</h4>
                  <span className="font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded text-sm">
                    R$ {item.price.toFixed(2)}
                  </span>
                </div>
                
                <p className="text-sm text-neutral-500 mb-3 line-clamp-2 min-h-[40px]">
                  {item.description || "Sem descrição."}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <div className="flex gap-2 text-xs font-medium">
                    <span className="bg-neutral-100 text-neutral-600 px-2 py-1 rounded flex items-center gap-1">
                      <Tag size={10} /> {catName}
                    </span>
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded flex items-center gap-1">
                      <LayoutGrid size={10} /> {getSectorLabel(item.preparationSector)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                       onClick={() => setEditingRecipeItem(item)}
                       className={`flex items-center gap-1 text-xs font-bold px-2 py-1.5 rounded transition-colors ${
                         hasRecipe 
                           ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100' 
                           : 'bg-neutral-50 text-neutral-500 border border-neutral-200 hover:bg-neutral-100'
                       }`}
                       title="Gerenciar Ficha Técnica"
                    >
                       <ClipboardList size={14} />
                       {hasRecipe ? 'Ficha Técnica' : 'Definir Receita'}
                    </button>
                    <button 
                      onClick={() => removeMenuItem(item.id)}
                      className="text-neutral-300 hover:text-red-500 transition-colors p-1"
                      title="Remover Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Formulário de Cadastro */}
      <div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-neutral-200 sticky top-24">
          <div className="flex items-center gap-2 mb-6 text-neutral-800">
            <PlusCircle className="text-orange-600" />
            <h3 className="text-xl font-bold">Adicionar Item</h3>
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Nome do Prato/Bebida</label>
              <div className="relative">
                <FileText size={18} className="absolute left-3 top-2.5 text-neutral-400" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  placeholder="Ex: Filé à Parmegiana"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Preço (R$)</label>
              <div className="relative">
                <DollarSign size={18} className="absolute left-3 top-2.5 text-neutral-400" />
                <input 
                  type="number" 
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Categoria</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-orange-500 outline-none bg-white"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Setor de Preparo (KDS)</label>
              <select 
                value={sector}
                onChange={(e) => setSector(e.target.value as PreparationSector)}
                className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-orange-500 outline-none bg-white"
              >
                <option value={PreparationSector.KITCHEN}>Cozinha Geral</option>
                <option value={PreparationSector.GRILL}>Churrasqueira</option>
                <option value={PreparationSector.BAR}>Bar / Copa</option>
                <option value={PreparationSector.DESSERT}>Sobremesas</option>
              </select>
              <p className="text-xs text-neutral-400 mt-1">Define em qual tela o pedido aparecerá.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Descrição</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                placeholder="Ingredientes principais, detalhes..."
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-neutral-900 text-white py-3 rounded-xl font-bold hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-900/20 mt-4 flex items-center justify-center gap-2"
            >
              <PlusCircle size={18} /> Cadastrar Item
            </button>
          </form>
        </div>
      </div>

      {editingRecipeItem && (
        <RecipeModal 
           item={editingRecipeItem} 
           onClose={() => setEditingRecipeItem(null)} 
        />
      )}
    </div>
  );
};