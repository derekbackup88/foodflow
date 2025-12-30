import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  Table, User, MenuItem, Ingredient, Recipe, Order, TableStatus, OrderStatus, OrderItem, ItemStatus, Role, PaymentMethod, PreparationSector
} from '../types';
import { v4 as uuidv4 } from 'uuid'; 

interface RestaurantContextType {
  tables: Table[];
  users: User[]; // Users list (without PINs for security)
  menu: MenuItem[];
  ingredients: Ingredient[];
  recipes: Recipe[];
  orders: Order[];
  currentUser: User | null;
  login: (userId: string, pin: string) => Promise<boolean>;
  logout: () => void;
  assignWaiter: (tableId: string, waiterId: string) => Promise<void>;
  createOrder: (tableId: string, waiterId: string) => Promise<string>; 
  updateOrderItems: (orderId: string, items: OrderItem[]) => Promise<void>;
  updateOrderItemStatus: (orderId: string, itemId: string, status: ItemStatus) => Promise<void>;
  completeOrder: (orderId: string, paymentMethod: PaymentMethod) => Promise<void>;
  closeTable: (tableId: string) => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  removeUser: (userId: string) => Promise<void>;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  removeMenuItem: (itemId: string) => Promise<void>;
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => Promise<void>;
  updateIngredient: (id: string, data: Partial<Ingredient>) => Promise<void>;
  removeIngredient: (id: string) => Promise<void>;
  addTable: (table: Omit<Table, 'id' | 'status'>) => Promise<void>;
  updateTable: (id: string, data: Partial<Table>) => Promise<void>;
  removeTable: (id: string) => Promise<void>;
  updateRecipe: (menuItemId: string, ingredients: { ingredientId: string, quantity: number }[]) => Promise<void>;
  isLoading: boolean;
  refreshData: () => void; // Expose refresh functionality
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- DATA FETCHING ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Users (Secure Fetch - No PINs ideally, but we fetch basic info)
      const { data: usersData, error: userError } = await supabase.from('users').select('id, name, role');
      if (usersData) setUsers(usersData as User[]);
      
      // If table doesn't exist, userError will be present. We handle this gracefully.
      if (userError) console.warn("Tabela de usuários não encontrada ou vazia (Modo Instalação).");

      // 2. Tables
      const { data: tablesData } = await supabase.from('tables').select('*').order('number');
      if (tablesData) {
        setTables(tablesData.map(t => ({
            id: t.id,
            number: t.number,
            seats: t.seats,
            status: t.status as TableStatus,
            assignedWaiterId: t.assigned_waiter_id,
            currentOrderId: undefined // We will link this via orders logic below
        })));
      }

      // 3. Menu
      const { data: menuData } = await supabase.from('menu_items').select('*');
      if (menuData) {
        setMenu(menuData.map(m => ({
            id: m.id,
            name: m.name,
            categoryId: m.category,
            price: m.price,
            description: m.description,
            preparationSector: m.preparation_sector as PreparationSector
        })));
      }

      // 4. Ingredients
      const { data: ingData } = await supabase.from('ingredients').select('*');
      if (ingData) {
        setIngredients(ingData.map(i => ({
            id: i.id,
            name: i.name,
            unit: i.unit,
            currentStock: i.current_stock,
            minStockLevel: i.min_stock_level,
            costPerUnit: i.cost_per_unit
        })));
      }

      // 5. Recipes
      const { data: recData } = await supabase.from('recipes').select('*');
      if (recData) {
        setRecipes(recData.map(r => ({
            menuItemId: r.menu_item_id,
            ingredientId: r.ingredient_id,
            quantityRequired: r.quantity_required
        })));
      }

      // 6. Active Orders & Link to Tables
      const { data: activeOrders } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (*)
        `)
        .neq('status', 'COMPLETED')
        .neq('status', 'CANCELLED');
      
      const { data: completedOrders } = await supabase
        .from('orders')
        .select(`*, order_items (*)`)
        .eq('status', 'COMPLETED')
        .order('created_at', { ascending: false })
        .limit(50); 

      const allFetchedOrders = [...(activeOrders || []), ...(completedOrders || [])];

      if (allFetchedOrders) {
        const formattedOrders: Order[] = allFetchedOrders.map((o: any) => ({
            id: o.id,
            tableId: o.table_id,
            waiterId: o.waiter_id,
            status: o.status as OrderStatus,
            totalAmount: o.total_amount,
            paymentMethod: o.payment_method as PaymentMethod,
            createdAt: o.created_at,
            items: o.order_items ? o.order_items.map((oi: any) => ({
                id: oi.id,
                menuItemId: oi.menu_item_id,
                quantity: oi.quantity,
                priceAtOrder: oi.price_at_order,
                notes: oi.notes,
                status: oi.status as ItemStatus
            })) : []
        }));
        
        setOrders(formattedOrders);

        setTables(prev => prev.map(t => {
            const activeOrder = formattedOrders.find(o => o.tableId === t.id && o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED);
            return activeOrder ? { ...t, currentOrderId: activeOrder.id, status: activeOrder.status === OrderStatus.PENDING ? TableStatus.WAITING_ORDER : TableStatus.OCCUPIED } : t;
        }));
      }

    } catch (error) {
      console.error("Critical error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshData = () => {
    fetchData();
  };

  // --- AUTHENTICATION ---
  const login = async (userId: string, pin: string): Promise<boolean> => {
    // 1. MODO DE INSTALAÇÃO (Emergency Access)
    // Permite logar para configurar o banco se o ID for 'setup-admin'
    if (userId === 'setup-admin' && pin === '1234') {
        setCurrentUser({
            id: 'setup-admin',
            name: 'Instalador (Temp)',
            role: Role.MANAGER,
            pin: '****'
        });
        return true;
    }

    // 2. Login Normal via Supabase
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .eq('pin', pin) 
        .single();
    
    if (data && !error) {
        setCurrentUser(data as User);
        return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    // Tenta recarregar dados reais ao sair, caso tenha feito setup
    fetchData();
  };

  // --- ACTIONS (Mantidas igual, apenas omitidas por brevidade se não mudaram, mas incluirei para garantir o XML completo) ---
  // ... (O restante das funções permanece idêntico, vou apenas reimprimir para garantir a integridade do arquivo)

  const addUser = async (userData: Omit<User, 'id'>) => {
    const { data, error } = await supabase.from('users').insert([{
        name: userData.name,
        role: userData.role,
        pin: userData.pin
    }]).select();

    if (data) {
        const newUser = data[0];
        setUsers(prev => [...prev, { id: newUser.id, name: newUser.name, role: newUser.role, pin: '****' }]);
    }
  };

  const removeUser = async (userId: string) => {
     await supabase.from('users').delete().eq('id', userId);
     setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const addMenuItem = async (itemData: Omit<MenuItem, 'id'>) => {
     const dbItem = {
         name: itemData.name,
         description: itemData.description,
         price: itemData.price,
         category: itemData.categoryId,
         preparation_sector: itemData.preparationSector
     };
     const { data } = await supabase.from('menu_items').insert([dbItem]).select();
     if (data) {
         fetchData(); 
     }
  };

  const removeMenuItem = async (itemId: string) => {
      await supabase.from('menu_items').delete().eq('id', itemId);
      setMenu(prev => prev.filter(m => m.id !== itemId));
  };

  const addIngredient = async (data: Omit<Ingredient, 'id'>) => {
      const dbIng = {
          name: data.name,
          unit: data.unit,
          current_stock: data.currentStock,
          min_stock_level: data.minStockLevel,
          cost_per_unit: data.costPerUnit
      };
      const { data: res } = await supabase.from('ingredients').insert([dbIng]).select();
      if (res) fetchData();
  };

  const updateIngredient = async (id: string, data: Partial<Ingredient>) => {
      const dbUpdate: any = {};
      if (data.name) dbUpdate.name = data.name;
      if (data.currentStock !== undefined) dbUpdate.current_stock = data.currentStock;
      if (data.minStockLevel !== undefined) dbUpdate.min_stock_level = data.minStockLevel;
      if (data.costPerUnit !== undefined) dbUpdate.cost_per_unit = data.costPerUnit;

      await supabase.from('ingredients').update(dbUpdate).eq('id', id);
      setIngredients(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  };

  const removeIngredient = async (id: string) => {
      await supabase.from('ingredients').delete().eq('id', id);
      setIngredients(prev => prev.filter(i => i.id !== id));
  };

  const updateRecipe = async (menuItemId: string, newIngredients: { ingredientId: string, quantity: number }[]) => {
      await supabase.from('recipes').delete().eq('menu_item_id', menuItemId);
      
      const rows = newIngredients.map(i => ({
          menu_item_id: menuItemId,
          ingredient_id: i.ingredientId,
          quantity_required: i.quantity
      }));
      
      if (rows.length > 0) {
        await supabase.from('recipes').insert(rows);
      }
      
      fetchData(); 
  };

  const addTable = async (data: Omit<Table, 'id' | 'status'>) => {
      await supabase.from('tables').insert([{ number: data.number, seats: data.seats, status: TableStatus.AVAILABLE }]);
      fetchData();
  };

  const updateTable = async (id: string, data: Partial<Table>) => {
      const dbUpdate: any = {};
      if (data.number) dbUpdate.number = data.number;
      if (data.seats) dbUpdate.seats = data.seats;
      if (data.status) dbUpdate.status = data.status;
      
      await supabase.from('tables').update(dbUpdate).eq('id', id);
      fetchData();
  };

  const removeTable = async (id: string) => {
      await supabase.from('tables').delete().eq('id', id);
      setTables(prev => prev.filter(t => t.id !== id));
  };

  const assignWaiter = async (tableId: string, waiterId: string) => {
      await supabase.from('tables').update({ assigned_waiter_id: waiterId }).eq('id', tableId);
      setTables(prev => prev.map(t => t.id === tableId ? { ...t, assignedWaiterId: waiterId } : t));
  };

  const createOrder = async (tableId: string, waiterId: string) => {
      const { data: orderData, error } = await supabase.from('orders').insert([{
          table_id: tableId,
          waiter_id: waiterId,
          status: OrderStatus.PENDING,
          total_amount: 0
      }]).select().single();

      if (error || !orderData) throw new Error("Failed to create order");

      await supabase.from('tables').update({ 
          status: TableStatus.OCCUPIED 
      }).eq('id', tableId);

      const newOrder: Order = {
          id: orderData.id,
          tableId,
          waiterId,
          status: OrderStatus.PENDING,
          items: [],
          totalAmount: 0,
          createdAt: orderData.created_at
      };
      
      setOrders(prev => [...prev, newOrder]);
      setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: TableStatus.OCCUPIED, currentOrderId: orderData.id, assignedWaiterId: waiterId } : t));

      return orderData.id;
  };

  const updateOrderItems = async (orderId: string, items: OrderItem[]) => {
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.priceAtOrder), 0);
    
    await supabase.from('orders').update({ total_amount: totalAmount }).eq('id', orderId);

    const dbItems = items.map(i => ({
        order_id: orderId,
        menu_item_id: i.menuItemId,
        quantity: i.quantity,
        price_at_order: i.priceAtOrder,
        status: i.status || ItemStatus.PENDING,
        notes: i.notes
    }));

    await supabase.from('order_items').delete().eq('order_id', orderId);
    await supabase.from('order_items').insert(dbItems);

    fetchData(); 
  };

  const updateOrderItemStatus = async (orderId: string, itemId: string, newStatus: ItemStatus) => {
      await supabase.from('order_items').update({ status: newStatus }).eq('id', itemId);

      const { data: allItems } = await supabase.from('order_items').select('status').eq('order_id', orderId);
      
      if (allItems) {
          const statuses = allItems.map((i: any) => i.status);
          const allReady = statuses.every((s: string) => s === ItemStatus.READY || s === ItemStatus.DELIVERED);
          
          if (allReady) {
              await supabase.from('orders').update({ status: OrderStatus.READY }).eq('id', orderId);
          } else if (statuses.some((s: string) => s === ItemStatus.PREPARING)) {
               await supabase.from('orders').update({ status: OrderStatus.PREPARING }).eq('id', orderId);
          }
      }

      setOrders(prev => prev.map(o => {
          if (o.id !== orderId) return o;
          const updatedItems = o.items.map(i => i.id === itemId ? { ...i, status: newStatus } : i);
          return { ...o, items: updatedItems };
      }));
  };

  const completeOrder = async (orderId: string, paymentMethod: PaymentMethod) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    await supabase.from('orders').update({
        status: OrderStatus.COMPLETED,
        payment_method: paymentMethod,
        completed_at: new Date().toISOString()
    }).eq('id', orderId);

    const inventoryUpdates: Record<string, number> = {};

    order.items.forEach(item => {
        const itemRecipes = recipes.filter(r => r.menuItemId === item.menuItemId);
        itemRecipes.forEach(recipe => {
            const qtyNeeded = recipe.quantityRequired * item.quantity;
            inventoryUpdates[recipe.ingredientId] = (inventoryUpdates[recipe.ingredientId] || 0) + qtyNeeded;
        });
    });

    for (const [ingId, deduction] of Object.entries(inventoryUpdates)) {
        const current = ingredients.find(i => i.id === ingId)?.currentStock || 0;
        await supabase.from('ingredients').update({ current_stock: current - deduction }).eq('id', ingId);
    }
    
    await supabase.from('financial_transactions').insert([{
        order_id: orderId,
        type: 'REVENUE',
        amount: order.totalAmount,
        description: `Mesa ${tables.find(t => t.id === order.tableId)?.number || '?'} - Pedido #${orderId.substring(0,4)}`
    }]);

    fetchData();
  };

  const closeTable = async (tableId: string) => {
      await supabase.from('tables').update({ status: TableStatus.DIRTY, current_order_id: null }).eq('id', tableId);
      
      setTimeout(async () => {
          await supabase.from('tables').update({ status: TableStatus.AVAILABLE, assigned_waiter_id: null }).eq('id', tableId);
          setTables(prev => prev.map(t => 
             t.id === tableId ? { ...t, status: TableStatus.AVAILABLE, assignedWaiterId: undefined } : t
          ));
      }, 5000);

      setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: TableStatus.DIRTY } : t));
  };

  return (
    <RestaurantContext.Provider value={{
      tables, users, menu, ingredients, recipes, orders, currentUser, isLoading, refreshData,
      login, logout, assignWaiter, createOrder, updateOrderItems, updateOrderItemStatus, completeOrder, closeTable,
      addUser, removeUser, addMenuItem, removeMenuItem,
      addIngredient, updateIngredient, removeIngredient,
      addTable, updateTable, removeTable, updateRecipe
    }}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) throw new Error("useRestaurant must be used within RestaurantProvider");
  return context;
};