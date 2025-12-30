import React, { useState } from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { TableMap } from './pages/TableMap';
import { Inventory } from './pages/Inventory';
import { Finance } from './pages/Finance';
import { BusinessIntelligence } from './pages/BusinessIntelligence';
import { KDS } from './pages/KDS';
import { TeamManagement } from './pages/TeamManagement';
import { MenuManagement } from './pages/MenuManagement';
import { SQL_SCHEMA, SQL_MIGRATION_KDS, SQL_SEED_DATA } from './constants';
import { Copy, Check } from 'lucide-react';

// Componente auxiliar para exibir e copiar código
const CodeBlock: React.FC<{ code: string; label: string }> = ({ code, label }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="flex justify-between items-center mb-2">
         <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{label}</span>
         <button 
           onClick={handleCopy}
           className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
             copied 
               ? 'bg-green-100 text-green-700 border border-green-200' 
               : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300'
           }`}
         >
           {copied ? <Check size={14} /> : <Copy size={14} />}
           {copied ? 'Copiado!' : 'Copiar SQL'}
         </button>
      </div>
      <div className="relative">
          <pre className="bg-neutral-900 text-neutral-50 p-4 rounded-xl overflow-x-auto text-xs font-mono border border-neutral-700 shadow-inner max-h-64 scrollbar-thin leading-relaxed">
              {code}
          </pre>
          <div className="absolute inset-0 pointer-events-none rounded-xl border border-white/5 ring-1 ring-black/5"></div>
      </div>
    </div>
  );
};

// Componente interno para gerenciar a lógica de exibição baseada no usuário logado
const RestaurantApp: React.FC = () => {
  const { currentUser } = useRestaurant();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Se não houver usuário logado, mostra a tela de Login
  if (!currentUser) {
    return <Login />;
  }

  // Se houver usuário, mostra o Layout principal com o conteúdo
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'tables': return <TableMap />;
      case 'kds': return <KDS />;
      case 'inventory': return <Inventory />;
      case 'menu': return <MenuManagement />;
      case 'finance': return <Finance />;
      case 'team': return <TeamManagement />;
      case 'bi': return <BusinessIntelligence />;
      case 'system': return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
              <h2 className="text-2xl font-bold text-neutral-800 mb-2">Instalação do Banco de Dados</h2>
              <p className="text-neutral-500 mb-6">Execute estes scripts no Editor SQL do Supabase para configurar seu sistema.</p>

              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">1</div>
                    <h3 className="font-bold text-lg text-neutral-800">Estrutura Completa (Schema)</h3>
                  </div>
                  <div className="pl-10">
                    <div className="p-4 bg-orange-50 text-orange-800 rounded-lg text-sm border border-orange-100 mb-4">
                        ⚠️ <strong>Atenção:</strong> Este script apaga tabelas existentes para criar uma instalação limpa. Use apenas na configuração inicial.
                    </div>
                    <CodeBlock code={SQL_SCHEMA} label="Script de Instalação" />
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-8">
                  <div className="flex items-center gap-2 mb-4">
                     <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">2</div>
                     <h3 className="font-bold text-lg text-neutral-800">Dados Iniciais (Seed)</h3>
                  </div>
                  <div className="pl-10">
                     <p className="text-sm text-neutral-500 mb-4">Popula o banco com dados de exemplo (mesas, usuários, etc) para teste.</p>
                     <CodeBlock code={SQL_SEED_DATA} label="Script de Seed" />
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-8">
                   <div className="flex items-center gap-2 mb-4">
                     <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center font-bold text-sm">3</div>
                     <h3 className="font-bold text-lg text-neutral-800">Migrações (Updates)</h3>
                   </div>
                   <div className="pl-10">
                      <p className="text-sm text-neutral-500 mb-4">Use apenas se precisar atualizar um banco existente.</p>
                      <CodeBlock code={SQL_MIGRATION_KDS} label="Update KDS" />
                   </div>
                </div>
              </div>
            </div>
        </div>
      );
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <RestaurantProvider>
      <RestaurantApp />
    </RestaurantProvider>
  );
};

export default App;