import React, { useMemo } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { OrderStatus, PaymentMethod } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { DollarSign, CreditCard, ShoppingBag } from 'lucide-react';

export const Finance: React.FC = () => {
  const { orders, menu } = useRestaurant();
  
  const completedOrders = orders.filter(o => o.status === OrderStatus.COMPLETED);
  const totalRevenue = completedOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  
  // Calculate average ticket
  const averageTicket = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

  // Data for Payment Methods Chart
  const paymentData = useMemo(() => {
      const counts: Record<string, number> = {};
      completedOrders.forEach(order => {
          const method = order.paymentMethod || 'OUTROS';
          counts[method] = (counts[method] || 0) + 1;
      });
      return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [completedOrders]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Data for Top Selling Items
  const topItemsData = useMemo(() => {
      const itemCounts: Record<string, number> = {};
      completedOrders.forEach(order => {
          order.items.forEach(item => {
              const menuItem = menu.find(m => m.id === item.menuItemId);
              if (menuItem) {
                  itemCounts[menuItem.name] = (itemCounts[menuItem.name] || 0) + item.quantity;
              }
          });
      });
      
      return Object.keys(itemCounts)
        .map(key => ({ name: key, sales: itemCounts[key] }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5); // Top 5
  }, [completedOrders, menu]);

  return (
    <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Relatórios Financeiros</h2>
          <p className="text-neutral-500">Histórico de transações, formas de pagamento e desempenho de produtos.</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-black text-white rounded-xl p-6 shadow-lg border-l-4 border-l-orange-500">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-neutral-400 text-sm font-medium">Receita Total</p>
                        <h3 className="text-4xl font-bold mt-2">R$ {totalRevenue.toFixed(2)}</h3>
                    </div>
                    <div className="p-2 bg-neutral-800 rounded-lg"><DollarSign size={20} /></div>
                </div>
            </div>
             <div className="bg-white text-neutral-900 border border-neutral-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-neutral-500 text-sm font-medium">Ticket Médio</p>
                        <h3 className="text-4xl font-bold mt-2">R$ {averageTicket.toFixed(2)}</h3>
                    </div>
                     <div className="p-2 bg-neutral-100 rounded-lg"><CreditCard size={20} /></div>
                </div>
            </div>
             <div className="bg-white text-neutral-900 border border-neutral-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-neutral-500 text-sm font-medium">Total Pedidos</p>
                        <h3 className="text-4xl font-bold mt-2">{completedOrders.length}</h3>
                    </div>
                     <div className="p-2 bg-neutral-100 rounded-lg"><ShoppingBag size={20} /></div>
                </div>
            </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Methods Pie Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
                <h3 className="font-bold text-neutral-800 mb-4">Formas de Pagamento</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={paymentData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {paymentData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Items Bar Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
                <h3 className="font-bold text-neutral-800 mb-4">Itens Mais Vendidos</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topItemsData} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12}} />
                            <Tooltip cursor={{fill: 'transparent'}} />
                            <Bar dataKey="sales" fill="#f97316" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200">
                <h3 className="font-bold text-neutral-700">Histórico de Transações</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase">ID Pedido</th>
                            <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase">Data</th>
                            <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase">Método</th>
                            <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase text-right">Valor</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {orders.slice().reverse().map(order => (
                            <tr key={order.id} className="hover:bg-neutral-50">
                                <td className="px-6 py-4 font-mono text-xs text-neutral-500">#{order.id.substring(0,8)}</td>
                                <td className="px-6 py-4 text-sm text-neutral-700">{new Date(order.createdAt).toLocaleString('pt-BR')}</td>
                                <td className="px-6 py-4">
                                    {order.paymentMethod ? (
                                        <span className="text-xs font-bold text-neutral-600 bg-neutral-100 px-2 py-1 rounded border border-neutral-200">
                                            {order.paymentMethod}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-neutral-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold tracking-wide ${
                                        order.status === 'COMPLETED' ? 'bg-orange-100 text-orange-700' : 'bg-neutral-100 text-neutral-600'
                                    }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-neutral-800 text-right">R$ {order.totalAmount.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};