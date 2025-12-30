import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { TableStatus, Order, OrderItem, PaymentMethod, Role, Table } from '../types';
import { Users, Utensils, CheckCircle, Clock, DollarSign, Coffee, CreditCard, Banknote, QrCode, Ticket, Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { CATEGORIES } from '../constants';

// Sub-component for taking orders & Payments
const OrderModal: React.FC<{ 
  tableId: string; 
  onClose: () => void; 
}> = ({ tableId, onClose }) => {
  const { tables, menu, createOrder, updateOrderItems, orders, completeOrder, closeTable, users } = useRestaurant();
  const table = tables.find(t => t.id === tableId);
  
  // Find current order or prepare to create new
  const currentOrder = orders.find(o => o.id === table?.currentOrderId);
  
  // Local state for the cart if it's a new order or editing existing
  const [cartItems, setCartItems] = useState<OrderItem[]>(currentOrder?.items || []);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [view, setView] = useState<'ORDER' | 'PAYMENT'>('ORDER');

  if (!table) return null;

  const handleAddItem = (menuItem: any) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.menuItemId === menuItem.id);
      if (existing) {
        return prev.map(i => i.menuItemId === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { 
        id: Math.random().toString(), 
        menuItemId: menuItem.id, 
        quantity: 1, 
        priceAtOrder: menuItem.price,
        status: 'PENDING'
      } as OrderItem];
    });
  };

  const handleRemoveItem = (itemId: string) => {
      setCartItems(prev => prev.filter(i => i.id !== itemId));
  };

  const handleSaveOrder = () => {
    let orderId = table.currentOrderId;
    if (!orderId) {
       const waiterId = table.assignedWaiterId || users[1].id; 
       orderId = createOrder(table.id, waiterId);
    }
    if (orderId) {
      updateOrderItems(orderId, cartItems);
    }
    onClose();
  };

  const handlePaymentSelection = (method: PaymentMethod) => {
      if (table.currentOrderId) {
          completeOrder(table.currentOrderId, method);
          closeTable(table.id);
          onClose();
      }
  };

  const total = cartItems.reduce((sum, item) => sum + (item.quantity * item.priceAtOrder), 0);

  const getStatusLabel = (status: TableStatus) => {
      switch(status) {
          case TableStatus.AVAILABLE: return 'Livre';
          case TableStatus.WAITING_ORDER: return 'Aguardando Pedido';
          case TableStatus.OCCUPIED: return 'Ocupada';
          case TableStatus.BILL_REQUESTED: return 'Conta Solicitada';
          case TableStatus.DIRTY: return 'Limpeza Necessária';
          default: return status;
      }
  };

  const getStatusColorClass = (status: TableStatus) => {
      switch(status) {
          case TableStatus.AVAILABLE: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
          case TableStatus.WAITING_ORDER: return 'bg-amber-100 text-amber-800 border-amber-200';
          case TableStatus.OCCUPIED: return 'bg-red-100 text-red-800 border-red-200';
          case TableStatus.BILL_REQUESTED: return 'bg-blue-100 text-blue-800 border-blue-200';
          case TableStatus.DIRTY: return 'bg-neutral-200 text-neutral-800 border-neutral-300';
          default: return 'bg-neutral-100 text-neutral-800';
      }
  }

  // --- PAYMENT VIEW ---
  if (view === 'PAYMENT') {
      return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-neutral-100 text-center">
                    <h2 className="text-2xl font-bold text-neutral-800">Finalizar Mesa {table.number}</h2>
                    <p className="text-neutral-500 mt-1">Selecione a forma de pagamento</p>
                    <div className="mt-4 text-3xl font-black text-neutral-900">R$ {total.toFixed(2)}</div>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4">
                    <button onClick={() => handlePaymentSelection(PaymentMethod.CREDIT)} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-neutral-200 hover:border-blue-500 hover:bg-blue-50 transition-all group">
                        <CreditCard size={32} className="text-neutral-400 group-hover:text-blue-600" />
                        <span className="font-bold text-neutral-700 group-hover:text-blue-700">Crédito</span>
                    </button>
                    <button onClick={() => handlePaymentSelection(PaymentMethod.DEBIT)} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-neutral-200 hover:border-cyan-500 hover:bg-cyan-50 transition-all group">
                        <CreditCard size={32} className="text-neutral-400 group-hover:text-cyan-600" />
                        <span className="font-bold text-neutral-700 group-hover:text-cyan-700">Débito</span>
                    </button>
                    <button onClick={() => handlePaymentSelection(PaymentMethod.PIX)} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all group">
                        <QrCode size={32} className="text-neutral-400 group-hover:text-emerald-600" />
                        <span className="font-bold text-neutral-700 group-hover:text-emerald-700">PIX</span>
                    </button>
                    <button onClick={() => handlePaymentSelection(PaymentMethod.CASH)} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-neutral-200 hover:border-green-500 hover:bg-green-50 transition-all group">
                        <Banknote size={32} className="text-neutral-400 group-hover:text-green-600" />
                        <span className="font-bold text-neutral-700 group-hover:text-green-700">Dinheiro</span>
                    </button>
                </div>
                <div className="p-4 bg-neutral-50 flex justify-center">
                    <button onClick={() => setView('ORDER')} className="text-neutral-500 hover:text-neutral-800 font-medium">Cancelar e Voltar</button>
                </div>
            </div>
        </div>
      )
  }

  // --- ORDER VIEW ---
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden border border-neutral-700">
        {/* Menu Selection */}
        <div className="flex-1 flex flex-col border-r border-neutral-200 bg-neutral-50">
            <div className="p-5 border-b border-neutral-200 bg-white">
                <h3 className="font-bold text-xl text-neutral-800">Cardápio</h3>
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                                selectedCategory === cat.id 
                                ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30 transform scale-105' 
                                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-2 lg:grid-cols-3 gap-5 content-start">
                {menu.filter(m => m.categoryId === selectedCategory).map(item => (
                    <button 
                        key={item.id}
                        onClick={() => handleAddItem(item)}
                        className="bg-white p-5 rounded-xl shadow-sm border border-neutral-200 hover:border-orange-500 hover:shadow-orange-100 hover:-translate-y-1 transition-all text-left flex flex-col justify-between h-36 group"
                    >
                        <div>
                            <h4 className="font-bold text-neutral-800 group-hover:text-orange-700 transition-colors text-lg">{item.name}</h4>
                            <p className="text-sm text-neutral-500 line-clamp-2 mt-2">{item.description}</p>
                        </div>
                        <div className="font-bold text-neutral-900 text-lg">R$ {item.price.toFixed(2)}</div>
                    </button>
                ))}
            </div>
        </div>

        {/* Order Summary (Cart) */}
        <div className="w-[400px] flex flex-col bg-white z-10 shadow-xl">
            <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
                <div className="flex justify-between items-start mb-2">
                    <div>
                         <h2 className="text-3xl font-bold text-neutral-800">Mesa {table.number}</h2>
                         <p className="text-sm text-neutral-500 mt-1 flex items-center gap-1">
                            <Users size={14} /> Garçom: <span className="font-medium text-neutral-700">{users.find(u => u.id === table.assignedWaiterId)?.name || '--'}</span>
                         </p>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full uppercase font-bold tracking-wide border ${getStatusColorClass(table.status)}`}>
                        {getStatusLabel(table.status)}
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-300 space-y-4">
                        <Coffee size={64} strokeWidth={1} />
                        <p className="font-medium">Nenhum item adicionado</p>
                    </div>
                ) : (
                    cartItems.map(item => {
                        const menuItem = menu.find(m => m.id === item.menuItemId);
                        return (
                            <div key={item.id} className="flex justify-between items-start border-b border-neutral-100 pb-4 last:border-0 animation-fade-in">
                                <div className="flex-1 pr-4">
                                    <div className="flex items-start gap-3">
                                        <span className="font-bold text-orange-600 bg-orange-50 w-6 h-6 flex items-center justify-center rounded text-sm">{item.quantity}</span>
                                        <div>
                                            <span className="text-neutral-800 font-medium block leading-tight">{menuItem?.name}</span>
                                            <span className="text-xs text-neutral-400 mt-0.5 block">R$ {item.priceAtOrder.toFixed(2)} un</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="font-bold text-neutral-900">R$ {(item.quantity * item.priceAtOrder).toFixed(2)}</span>
                                    <button 
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="text-[10px] text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-0.5 rounded transition-colors"
                                    >
                                        Remover
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="p-6 bg-neutral-50 border-t border-neutral-200">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-medium text-neutral-500">Total</span>
                    <span className="text-4xl font-bold text-neutral-900">R$ {total.toFixed(2)}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-3.5 rounded-xl border border-neutral-300 text-neutral-600 font-semibold hover:bg-neutral-100 transition-colors"
                    >
                        Voltar
                    </button>
                    
                    {table.status === TableStatus.AVAILABLE || table.status === TableStatus.WAITING_ORDER ? (
                         <button 
                            onClick={handleSaveOrder}
                            disabled={cartItems.length === 0}
                            className="px-4 py-3.5 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-95"
                        >
                            {table.status === TableStatus.AVAILABLE ? 'Abrir Mesa' : 'Adicionar Pedido'}
                        </button>
                    ) : (
                        <button 
                            onClick={() => setView('PAYMENT')}
                            className={`px-4 py-3.5 rounded-xl text-white font-semibold shadow-lg transition-all hover:scale-[1.02] active:scale-95 ${
                                table.status === TableStatus.BILL_REQUESTED 
                                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' 
                                : 'bg-red-600 hover:bg-red-700 shadow-red-200'
                            }`}
                        >
                            Fechar Conta
                        </button>
                    )}
                    
                    {(table.status === TableStatus.OCCUPIED || table.status === TableStatus.BILL_REQUESTED) && (
                         <button 
                            onClick={handleSaveOrder}
                            className="col-span-2 px-4 py-3 rounded-xl border-orange-200 border bg-orange-50 text-orange-700 font-semibold hover:bg-orange-100 transition-colors"
                        >
                            Atualizar / Adicionar Itens
                        </button>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component for Managing Tables (Add/Edit)
const TableManagerModal: React.FC<{
    table?: Table;
    onClose: () => void;
}> = ({ table, onClose }) => {
    const { addTable, updateTable, removeTable } = useRestaurant();
    const [number, setNumber] = useState(table?.number.toString() || '');
    const [seats, setSeats] = useState(table?.seats.toString() || '');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const num = parseInt(number);
        const s = parseInt(seats);
        
        if (isNaN(num) || isNaN(s)) return;

        if (table) {
            updateTable(table.id, { number: num, seats: s });
        } else {
            addTable({ number: num, seats: s });
        }
        onClose();
    };

    const handleDelete = () => {
        if (table && confirm(`Tem certeza que deseja remover a Mesa ${table.number}?`)) {
            removeTable(table.id);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-neutral-800">{table ? `Editar Mesa ${table.number}` : 'Nova Mesa'}</h2>
                    <button onClick={onClose}><X size={20} className="text-neutral-400 hover:text-neutral-800" /></button>
                </div>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-neutral-600 mb-1">Número da Mesa</label>
                        <input 
                            type="number" 
                            value={number} 
                            onChange={e => setNumber(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-neutral-600 mb-1">Capacidade (Lugares)</label>
                        <input 
                            type="number" 
                            value={seats} 
                            onChange={e => setSeats(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            required
                        />
                    </div>
                    
                    <div className="pt-4 flex gap-3">
                         <button type="submit" className="flex-1 bg-neutral-900 text-white py-3 rounded-xl font-bold hover:bg-black">
                            Salvar
                         </button>
                         {table && (
                             <button type="button" onClick={handleDelete} className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100">
                                <Trash2 size={20} />
                             </button>
                         )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export const TableMap: React.FC = () => {
  const { tables, orders, users, currentUser } = useRestaurant();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | undefined>(undefined);
  const [showAddModal, setShowAddModal] = useState(false);

  // Core Logic for Color Mapping
  const getTableStyles = (status: TableStatus) => {
    switch (status) {
      case TableStatus.AVAILABLE: 
        return 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600 shadow-emerald-200';
      case TableStatus.WAITING_ORDER: 
        return 'bg-amber-400 text-neutral-900 border-amber-500 hover:bg-amber-500 shadow-amber-200';
      case TableStatus.OCCUPIED: 
        return 'bg-red-600 text-white border-red-700 hover:bg-red-700 shadow-red-200';
      case TableStatus.BILL_REQUESTED: 
        return 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 shadow-blue-200';
      case TableStatus.DIRTY:
        return 'bg-neutral-500 text-white border-neutral-600 hover:bg-neutral-600 shadow-neutral-200';
      default: 
        return 'bg-neutral-200 text-neutral-500';
    }
  };

  const getStatusIcon = (status: TableStatus) => {
    switch (status) {
      case TableStatus.WAITING_ORDER: return <Clock size={20} className="opacity-75" />;
      case TableStatus.OCCUPIED: return <Utensils size={20} className="opacity-75" />;
      case TableStatus.BILL_REQUESTED: return <DollarSign size={20} className="opacity-75" />;
      case TableStatus.DIRTY: return <Coffee size={20} className="opacity-75" />;
      default: return <CheckCircle size={20} className="opacity-75" />;
    }
  };

  const getStatusLabel = (status: TableStatus) => {
      switch(status) {
          case TableStatus.AVAILABLE: return 'Livre';
          case TableStatus.WAITING_ORDER: return 'Aguardando';
          case TableStatus.OCCUPIED: return 'Ocupada';
          case TableStatus.BILL_REQUESTED: return 'Conta';
          case TableStatus.DIRTY: return 'Limpeza';
          default: return '';
      }
  }

  const handleTableClick = (table: Table) => {
      if (isEditMode) {
          setEditingTable(table);
      } else {
          setSelectedTableId(table.id);
      }
  };

  const canManageTables = currentUser?.role === Role.MANAGER;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Mapa de Mesas</h2>
          <p className="text-neutral-500 mt-1">Gerenciamento visual em tempo real.</p>
        </div>
        
        <div className="flex items-center gap-4">
             {canManageTables && (
                 <div className="flex bg-white p-1 rounded-lg border border-neutral-200 shadow-sm">
                    <button 
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${isEditMode ? 'bg-orange-100 text-orange-700' : 'text-neutral-600 hover:bg-neutral-50'}`}
                    >
                        {isEditMode ? <CheckCircle size={16} /> : <Edit size={16} />}
                        {isEditMode ? 'Concluir Edição' : 'Editar Mesas'}
                    </button>
                    {isEditMode && (
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm text-green-700 hover:bg-green-50 transition-all ml-1"
                        >
                            <Plus size={16} /> Nova Mesa
                        </button>
                    )}
                 </div>
             )}

            {/* Interactive Legend */}
            <div className="hidden xl:flex flex-wrap gap-3 bg-white p-2 rounded-xl border border-neutral-200 shadow-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-semibold text-emerald-800">Livre</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100">
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <span className="text-xs font-semibold text-amber-800">Aguardando</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-100">
                    <div className="w-3 h-3 rounded-full bg-red-600"></div>
                    <span className="text-xs font-semibold text-red-800">Ocupada</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    <span className="text-xs font-semibold text-blue-800">Conta</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.sort((a,b) => a.number - b.number).map(table => {
          const activeOrder = orders.find(o => o.id === table.currentOrderId);
          const waiter = users.find(u => u.id === table.assignedWaiterId);
          const styles = getTableStyles(table.status);

          return (
            <button
              key={table.id}
              onClick={() => handleTableClick(table)}
              className={`
                relative h-56 rounded-3xl transition-all duration-300 
                flex flex-col items-center justify-between p-6 shadow-md hover:shadow-xl hover:-translate-y-1
                border-b-4 ${isEditMode ? 'bg-neutral-100 border-neutral-300 border-dashed text-neutral-400' : styles}
              `}
            >
              {isEditMode && (
                  <div className="absolute top-2 right-2 p-2 bg-white rounded-full text-neutral-600 shadow-sm">
                      <Edit size={16} />
                  </div>
              )}

              {/* Header: Status Icon & Seats */}
              <div className="w-full flex justify-between items-start opacity-90">
                <div className="flex flex-col items-start">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-80">{getStatusLabel(table.status)}</span>
                </div>
                {!isEditMode && getStatusIcon(table.status)}
              </div>
              
              {/* Center: Table Number */}
              <div className="flex flex-col items-center">
                <span className={`text-6xl font-black tracking-tighter leading-none ${isEditMode ? 'text-neutral-400' : ''}`}>{table.number}</span>
                <div className="flex items-center gap-1.5 mt-2 opacity-80 text-sm font-medium bg-black/10 px-3 py-1 rounded-full">
                    <Users size={12} strokeWidth={3} />
                    <span>{table.seats} Lugares</span>
                </div>
              </div>

              {/* Footer: Order Info */}
              <div className="w-full pt-4 border-t border-black/10 mt-2">
                 {!isEditMode && table.status !== TableStatus.AVAILABLE && activeOrder ? (
                    <div className="flex justify-between items-end">
                        <div className="text-left">
                            <p className="text-[10px] uppercase font-bold opacity-60">Total</p>
                            <p className="font-bold text-lg leading-tight">R$ {activeOrder.totalAmount.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-[10px] uppercase font-bold opacity-60">Garçom</p>
                             <p className="text-xs font-medium truncate max-w-[80px]">{waiter?.name.split(' ')[0] || '--'}</p>
                        </div>
                    </div>
                 ) : (
                    <div className="text-center opacity-60 text-sm font-medium">
                        {isEditMode ? 'Toque para editar' : 'Toque para detalhes'}
                    </div>
                 )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedTableId && (
        <OrderModal 
          tableId={selectedTableId} 
          onClose={() => setSelectedTableId(null)} 
        />
      )}

      {(showAddModal || editingTable) && (
          <TableManagerModal 
            table={editingTable}
            onClose={() => {
                setShowAddModal(false);
                setEditingTable(undefined);
            }}
          />
      )}
    </div>
  );
};