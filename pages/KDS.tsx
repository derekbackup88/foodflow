import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { PreparationSector, OrderStatus, ItemStatus, Order, OrderItem } from '../types';
import { Clock, CheckCircle, Play, Flame, Beer, ChefHat, IceCream, BellRing, MonitorPlay } from 'lucide-react';

const SECTORS = [
    { id: PreparationSector.KITCHEN, label: 'Cozinha', icon: ChefHat, color: 'text-blue-600' },
    { id: PreparationSector.GRILL, label: 'Churrasqueira', icon: Flame, color: 'text-red-600' },
    { id: PreparationSector.BAR, label: 'Bar', icon: Beer, color: 'text-amber-600' },
    { id: PreparationSector.DESSERT, label: 'Sobremesas', icon: IceCream, color: 'text-pink-600' },
];

const OrderCard: React.FC<{ 
    order: Order; 
    items: OrderItem[]; // Items already filtered by sector
    onUpdateStatus: (itemId: string, status: ItemStatus) => void; 
    tableNumber: number;
}> = ({ order, items, onUpdateStatus, tableNumber }) => {
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const start = new Date(order.createdAt).getTime();
            setElapsedTime(Math.floor((now - start) / 60000)); // Minutes
        }, 1000);
        return () => clearInterval(interval);
    }, [order.createdAt]);

    // Color Logic for Delay
    let bgClass = "bg-white border-neutral-200";
    let timerClass = "text-neutral-500";
    
    if (elapsedTime >= 15) {
        bgClass = "bg-red-50 border-red-300";
        timerClass = "text-red-600 font-bold animate-pulse";
    } else if (elapsedTime >= 5) {
        bgClass = "bg-yellow-50 border-yellow-300";
        timerClass = "text-yellow-600 font-semibold";
    }

    // Check if whole card is done
    const isCardDone = items.every(i => i.status === ItemStatus.READY || i.status === ItemStatus.DELIVERED);

    if (isCardDone) return null; // Remove from KDS if all items for this sector are ready

    return (
        <div className={`rounded-xl shadow-sm border-2 p-4 flex flex-col gap-4 transition-all ${bgClass}`}>
            {/* Header */}
            <div className="flex justify-between items-start border-b border-black/5 pb-3">
                <div>
                    <h3 className="text-2xl font-black text-neutral-800">Mesa {tableNumber}</h3>
                    <p className="text-xs text-neutral-500 font-mono">#{order.id.substring(0,6)}</p>
                </div>
                <div className={`flex items-center gap-1.5 ${timerClass}`}>
                    <Clock size={16} />
                    <span className="text-lg">{elapsedTime} min</span>
                </div>
            </div>

            {/* Items List */}
            <div className="flex-1 space-y-3">
                {items.map(item => {
                    if (item.status === ItemStatus.READY || item.status === ItemStatus.DELIVERED) return null;

                    return (
                        <div key={item.id} className="flex justify-between items-center bg-white/60 p-2 rounded-lg border border-black/5">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-lg text-neutral-800">{item.quantity}x</span>
                                    <span className="font-medium text-neutral-700">{item.notes || 'Normal'}</span>
                                    {/* Name would come from joining with menu, passed down ideally or mapped */}
                                </div>
                                {/* For demo, we rely on context to map IDs, but here we assume 'notes' holds name or we fetch name */}
                                <ItemNameDisplay itemId={item.menuItemId} />
                            </div>

                            <div className="flex gap-2">
                                {item.status === ItemStatus.PENDING && (
                                    <button 
                                        onClick={() => onUpdateStatus(item.id, ItemStatus.PREPARING)}
                                        className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                        title="Iniciar Preparo"
                                    >
                                        <Play size={20} />
                                    </button>
                                )}
                                <button 
                                    onClick={() => onUpdateStatus(item.id, ItemStatus.READY)}
                                    className={`p-2 rounded text-white transition-colors ${
                                        item.status === ItemStatus.PREPARING 
                                            ? 'bg-green-600 hover:bg-green-700 shadow-md' 
                                            : 'bg-neutral-300 hover:bg-neutral-400'
                                    }`}
                                    title="Marcar como Pronto"
                                >
                                    <CheckCircle size={20} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-black/5 flex justify-end">
                <button className="text-xs font-semibold text-neutral-500 flex items-center gap-1 hover:text-orange-600">
                    <BellRing size={14} /> Chamar Garçom
                </button>
            </div>
        </div>
    );
};

const ItemNameDisplay: React.FC<{ itemId: string }> = ({ itemId }) => {
    const { menu } = useRestaurant();
    const item = menu.find(m => m.id === itemId);
    return <div className="text-sm text-neutral-600">{item?.name || 'Item Desconhecido'}</div>;
}

export const KDS: React.FC = () => {
    const { orders, tables, menu, updateOrderItemStatus } = useRestaurant();
    const [selectedSector, setSelectedSector] = useState<PreparationSector>(PreparationSector.KITCHEN);

    // FILTERING LOGIC: Intelligent Routing
    const activeOrders = orders.filter(o => 
        o.status !== OrderStatus.COMPLETED && 
        o.status !== OrderStatus.CANCELLED &&
        o.status !== OrderStatus.READY // If whole order is ready, remove from KDS
    );

    const filteredOrders = activeOrders.map(order => {
        // Filter items for this specific sector
        const sectorItems = order.items.filter(item => {
            const menuItem = menu.find(m => m.id === item.menuItemId);
            // Include item if it matches sector AND is not yet fully delivered
            return menuItem?.preparationSector === selectedSector && item.status !== ItemStatus.DELIVERED;
        });

        return { ...order, items: sectorItems };
    }).filter(order => order.items.length > 0); // Remove orders with no items for this sector

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-neutral-800 flex items-center gap-3">
                        <MonitorPlay className="text-neutral-900" />
                        KDS - Kitchen Display System
                    </h2>
                    <p className="text-neutral-500 mt-1">Gerenciamento de produção por setor.</p>
                </div>
                
                {/* Sector Selector */}
                <div className="bg-white p-1.5 rounded-xl shadow-sm border border-neutral-200 flex gap-2">
                    {SECTORS.map(sector => (
                        <button
                            key={sector.id}
                            onClick={() => setSelectedSector(sector.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                                selectedSector === sector.id
                                    ? 'bg-neutral-900 text-white shadow-md'
                                    : 'text-neutral-500 hover:bg-neutral-100'
                            }`}
                        >
                            <sector.icon size={18} className={selectedSector !== sector.id ? sector.color : ''} />
                            {sector.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Grid */}
            {filteredOrders.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-neutral-300 border-2 border-dashed border-neutral-200 rounded-2xl">
                    <CheckCircle size={64} className="mb-4 opacity-50" />
                    <h3 className="text-xl font-medium text-neutral-400">Tudo limpo por aqui!</h3>
                    <p className="text-sm">Nenhum pedido pendente para {SECTORS.find(s => s.id === selectedSector)?.label}.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-10">
                    {filteredOrders.map(order => (
                        <OrderCard 
                            key={order.id} 
                            order={order} 
                            items={order.items}
                            tableNumber={tables.find(t => t.id === order.tableId)?.number || 0}
                            onUpdateStatus={updateOrderItemStatus}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};