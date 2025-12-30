import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Role } from '../types';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ChefHat, 
  DollarSign, 
  Database, 
  LogOut,
  UserCircle,
  BrainCircuit,
  MonitorPlay,
  Users,
  BookOpen
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// Custom Brand Icon
const GastroLogo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <rect width="40" height="40" rx="12" fill="url(#brand_gradient)" />
    {/* Cloche Shape */}
    <path d="M10 24H30C30 18.4772 25.5228 14 20 14C14.4772 14 10 18.4772 10 24Z" fill="white" fillOpacity="0.95" />
    <circle cx="20" cy="12" r="2.5" fill="white" />
    {/* Flow/Speed Line */}
    <path d="M8 27H24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.8" />
    <path d="M28 27H32" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.5" />
    <defs>
      <linearGradient id="brand_gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#EA580C" /> {/* Orange-600 */}
        <stop offset="1" stopColor="#DC2626" /> {/* Red-600 */}
      </linearGradient>
    </defs>
  </svg>
);

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { currentUser, logout } = useRestaurant();

  const navItems = [
    // Dashboard: Acesso geral (Home)
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard, allowed: [Role.MANAGER, Role.WAITER, Role.CHEF] },
    
    // Gestão de Mesas: Gerente e Garçom
    { id: 'tables', label: 'Gestão de Mesas', icon: UtensilsCrossed, allowed: [Role.MANAGER, Role.WAITER] },
    
    // KDS: Gerente e Cozinheiro
    { id: 'kds', label: 'KDS (Cozinha)', icon: MonitorPlay, allowed: [Role.MANAGER, Role.CHEF] },
    
    // Estoque: Todos (Gerente, Cozinheiro e Garçom conforme solicitado)
    { id: 'inventory', label: 'Estoque', icon: ChefHat, allowed: [Role.MANAGER, Role.CHEF, Role.WAITER] },
    
    // Cardápio (Novo): Todos podem ver/gerenciar conforme fluxo de trabalho
    { id: 'menu', label: 'Cardápio', icon: BookOpen, allowed: [Role.MANAGER, Role.CHEF, Role.WAITER] },
    
    // Módulos Administrativos: Apenas Gerente
    { id: 'finance', label: 'Financeiro', icon: DollarSign, allowed: [Role.MANAGER] },
    { id: 'team', label: 'Equipe', icon: Users, allowed: [Role.MANAGER] }, 
    { id: 'bi', label: 'IA Analyst', icon: BrainCircuit, allowed: [Role.MANAGER] },
    { id: 'system', label: 'Sistema (SQL)', icon: Database, allowed: [Role.MANAGER] },
  ];

  // Filter items based on role
  const visibleItems = navItems.filter(item => 
    currentUser && item.allowed.includes(currentUser.role)
  );

  return (
    <div className="flex h-screen bg-neutral-100">
      {/* Sidebar - Gradient Theme */}
      <aside className="w-64 bg-gradient-to-b from-orange-950 via-neutral-900 to-black text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <GastroLogo />
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500 tracking-tight">
              GastroFlow
            </h1>
            <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest">Enterprise</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-800">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                activeTab === item.id 
                  ? 'bg-white/10 text-white shadow-lg border-l-4 border-orange-500 backdrop-blur-sm' 
                  : 'text-neutral-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-orange-500' : 'group-hover:text-neutral-300'} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-3 mb-3">
            <UserCircle size={32} className="text-neutral-400" />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-orange-400 uppercase tracking-wider font-bold">{currentUser?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 text-xs font-medium text-red-400 hover:text-red-300 py-2 border border-red-900/30 rounded hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={14} /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative bg-neutral-50">
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
            <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
               {activeTab === 'dashboard' && <LayoutDashboard size={20} className="text-neutral-400" />}
               {navItems.find(n => n.id === activeTab)?.label}
            </h2>
            <div className="flex items-center gap-4">
              <span className="px-4 py-1.5 bg-neutral-100 rounded-full text-xs font-bold text-neutral-600 border border-neutral-200 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                {new Date().toLocaleDateString('pt-BR')}
              </span>
            </div>
        </header>
        <div className="p-8 pb-24 max-w-[1920px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};