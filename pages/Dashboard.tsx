import React, { useMemo } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { OrderStatus } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { TrendingUp, Users, AlertTriangle, DollarSign } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { orders, tables, ingredients } = useRestaurant();

  // Stats Logic
  const totalRevenue = orders
    .filter(o => o.status === OrderStatus.COMPLETED)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const activeOrders = orders.filter(o => o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED).length;
  const occupiedTables = tables.filter(t => t.status === 'OCCUPIED').length;
  const lowStockCount = ingredients.filter(i => i.currentStock <= i.minStockLevel).length;

  // Chart Data Preparation
  const revenueData = useMemo(() => {
    // Mocking a timeline based on current orders plus simulated past
    return [
      { time: '12:00', sales: 120 },
      { time: '13:00', sales: 450 },
      { time: '14:00', sales: 320 },
      { time: '15:00', sales: 150 },
      { time: '16:00', sales: totalRevenue }, // Current live data point
    ];
  }, [totalRevenue]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 flex items-start justify-between border-l-4 border-l-orange-500">
          <div>
            <p className="text-sm font-medium text-neutral-500">Receita Hoje</p>
            <h3 className="text-2xl font-bold text-neutral-900 mt-2">R$ {totalRevenue.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">Mesas Ativas</p>
            <h3 className="text-2xl font-bold text-neutral-900 mt-2">{occupiedTables} <span className="text-sm font-normal text-neutral-400">/ {tables.length}</span></h3>
          </div>
          <div className="p-3 bg-neutral-100 text-neutral-600 rounded-lg">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">Pedidos Pendentes</p>
            <h3 className="text-2xl font-bold text-neutral-900 mt-2">{activeOrders}</h3>
          </div>
          <div className="p-3 bg-neutral-100 text-neutral-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">Alerta de Estoque</p>
            <h3 className={`text-2xl font-bold mt-2 ${lowStockCount > 0 ? 'text-red-600' : 'text-neutral-900'}`}>{lowStockCount}</h3>
          </div>
          <div className={`p-3 rounded-lg ${lowStockCount > 0 ? 'bg-red-50 text-red-600' : 'bg-neutral-50 text-neutral-400'}`}>
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-neutral-200 flex flex-col">
          <h4 className="text-lg font-semibold text-neutral-800 mb-6">Tendência de Receita (Por Hora)</h4>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis dataKey="time" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#737373" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0a0a0a', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 overflow-hidden flex flex-col">
          <h4 className="text-lg font-semibold text-neutral-800 mb-4">Atividade Recente</h4>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {orders.slice().reverse().slice(0, 6).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-700">Mesa {tables.find(t => t.id === order.tableId)?.number}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        order.status === 'COMPLETED' ? 'bg-orange-100 text-orange-700 border-orange-200' : 
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                        {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">{order.items.length} itens • R$ {order.totalAmount.toFixed(2)}</p>
                </div>
                <span className="text-xs text-neutral-400">{new Date(order.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            ))}
            {orders.length === 0 && <p className="text-neutral-400 text-center py-4">Nenhuma atividade recente.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};