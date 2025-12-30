import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Role } from '../types';
import { ChefHat, Shield, User, KeyRound, Delete, LogIn, Loader2, Database, AlertTriangle } from 'lucide-react';

export const Login: React.FC = () => {
  const { users, login, isLoading: isContextLoading, refreshData } = useRestaurant();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // --- MODO DE INSTALAÇÃO ---
  // Verifica se não há usuários carregados (banco vazio ou sem conexão)
  const isSetupMode = !isContextLoading && users.length === 0;

  const selectedUser = users.find(u => u.id === selectedUserId);

  const handleNumPad = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedUser) return;

    setIsAuthenticating(true);
    try {
        const success = await login(selectedUser.id, pin);
        if (!success) {
            setError('PIN Incorreto');
            setPin('');
        }
    } catch (err) {
        setError('Erro de conexão');
    } finally {
        setIsAuthenticating(false);
    }
  };

  const handleSetupLogin = async () => {
      setIsAuthenticating(true);
      // Credenciais hardcoded no Context para modo de instalação
      const success = await login('setup-admin', '1234');
      if (!success) {
          setError('Falha ao iniciar modo de instalação');
          setIsAuthenticating(false);
      }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case Role.MANAGER: return <Shield size={24} className="text-purple-600" />;
      case Role.CHEF: return <ChefHat size={24} className="text-orange-600" />;
      case Role.WAITER: return <User size={24} className="text-blue-600" />;
    }
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case Role.MANAGER: return 'Gerência';
      case Role.CHEF: return 'Cozinha';
      case Role.WAITER: return 'Salão';
    }
  };

  const groupedUsers = {
    [Role.MANAGER]: users.filter(u => u.role === Role.MANAGER),
    [Role.WAITER]: users.filter(u => u.role === Role.WAITER),
    [Role.CHEF]: users.filter(u => u.role === Role.CHEF),
  };

  if (isContextLoading) {
      return (
          <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center text-white">
              <Loader2 size={48} className="animate-spin text-orange-500 mb-4" />
              <p className="text-neutral-400">Conectando ao servidor...</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-5xl h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: User Selection or Setup Info */}
        <div className="flex-1 bg-neutral-50 p-8 overflow-y-auto border-r border-neutral-200">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
              GastroFlow
            </h1>
            <p className="text-neutral-400 font-medium">
                {isSetupMode ? 'Configuração Inicial' : 'Selecione seu perfil'}
            </p>
          </div>

          {isSetupMode ? (
              <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 space-y-4 animate-in fade-in slide-in-from-left-4">
                  <div className="flex items-center gap-3 text-orange-800">
                      <AlertTriangle size={32} />
                      <h3 className="font-bold text-lg">Banco de Dados Vazio</h3>
                  </div>
                  <p className="text-sm text-orange-800/80 leading-relaxed">
                      Não encontramos nenhum usuário cadastrado no sistema. Isso geralmente acontece na <strong>primeira execução</strong>.
                  </p>
                  <p className="text-sm text-orange-800/80 leading-relaxed">
                      Para criar as tabelas do banco de dados, você precisa entrar no <strong>Modo de Instalação</strong>.
                  </p>
                  <div className="pt-2">
                      <h4 className="font-bold text-sm text-neutral-700 mb-2">Passos para correção:</h4>
                      <ol className="list-decimal list-inside text-sm text-neutral-600 space-y-1">
                          <li>Clique em "Instalar Sistema" ao lado.</li>
                          <li>Acesse a aba <strong>Sistema (SQL)</strong> no menu.</li>
                          <li>Copie o script SQL.</li>
                          <li>Execute no Painel do Supabase.</li>
                      </ol>
                  </div>
                  <button 
                    onClick={refreshData}
                    className="w-full mt-4 py-2 bg-white border border-orange-200 text-orange-700 rounded-lg hover:bg-orange-100 font-medium text-sm flex items-center justify-center gap-2"
                  >
                      <Database size={14} /> Tentar Reconectar
                  </button>
              </div>
          ) : (
            <div className="space-y-6">
                {(Object.keys(groupedUsers) as Role[]).map((role) => (
                groupedUsers[role].length > 0 && (
                    <div key={role}>
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        {getRoleLabel(role)}
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {groupedUsers[role].map(user => (
                        <button
                            key={user.id}
                            onClick={() => {
                            setSelectedUserId(user.id);
                            setPin('');
                            setError('');
                            }}
                            className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                            selectedUserId === user.id
                                ? 'border-orange-500 bg-orange-50 shadow-md transform scale-[1.02]'
                                : 'border-white bg-white shadow-sm hover:border-orange-200'
                            }`}
                        >
                            <div className={`p-3 rounded-full ${
                            selectedUserId === user.id ? 'bg-white' : 'bg-neutral-100'
                            }`}>
                            {getRoleIcon(user.role)}
                            </div>
                            <div>
                            <span className={`block font-bold text-lg ${selectedUserId === user.id ? 'text-orange-900' : 'text-neutral-800'}`}>
                                {user.name}
                            </span>
                            <span className="text-xs text-neutral-400">ID: {user.id.substring(0,4)}...</span>
                            </div>
                        </button>
                        ))}
                    </div>
                    </div>
                )
                ))}
            </div>
          )}
        </div>

        {/* Right Side: PIN Entry or Setup Button */}
        <div className="flex-1 bg-white p-8 flex flex-col items-center justify-center relative">
          
          {isSetupMode ? (
             <div className="w-full max-w-xs text-center animate-in zoom-in-95">
                 <div className="w-20 h-20 mx-auto bg-neutral-900 rounded-full flex items-center justify-center mb-6 text-white shadow-xl">
                    <Database size={32} />
                 </div>
                 <h2 className="text-2xl font-bold text-neutral-800 mb-2">Instalação</h2>
                 <p className="text-neutral-500 text-sm mb-8">Entre como administrador temporário para configurar o banco.</p>

                 <button
                    onClick={handleSetupLogin}
                    disabled={isAuthenticating}
                    className="w-full py-4 bg-neutral-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-xl shadow-neutral-900/20"
                >
                    {isAuthenticating ? <Loader2 className="animate-spin" /> : <LogIn size={20} />}
                    {isAuthenticating ? 'Acessando...' : 'Entrar no Modo Instalação'}
                </button>
             </div>
          ) : (
              !selectedUserId ? (
                <div className="text-center text-neutral-400 animate-pulse">
                <User size={64} className="mx-auto mb-4 opacity-20" />
                <p>Selecione um usuário ao lado para entrar</p>
                </div>
            ) : (
                <div className="w-full max-w-xs animate-in slide-in-from-right duration-300">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto bg-neutral-100 rounded-full flex items-center justify-center mb-4 text-orange-600 border-4 border-white shadow-lg">
                        {getRoleIcon(selectedUser!.role)}
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-800">{selectedUser?.name}</h2>
                    <p className="text-neutral-500 text-sm">Digite seu PIN de acesso</p>
                </div>

                {/* PIN Display */}
                <div className="mb-6 flex justify-center gap-2">
                    {[0, 1, 2, 3].map((i) => (
                    <div 
                        key={i}
                        className={`w-4 h-4 rounded-full transition-all ${
                        pin.length > i ? 'bg-orange-600 scale-110' : 'bg-neutral-200'
                        }`}
                    />
                    ))}
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-center text-sm py-2 rounded-lg mb-4 font-medium animate-bounce">
                    {error}
                    </div>
                )}

                {/* Numeric Keypad */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleNumPad(num.toString())}
                        className="h-16 rounded-xl bg-neutral-50 hover:bg-neutral-100 text-2xl font-bold text-neutral-700 transition-colors shadow-sm border border-neutral-200 active:scale-95"
                    >
                        {num}
                    </button>
                    ))}
                    <div className="flex items-center justify-center">
                    <KeyRound size={24} className="text-neutral-300" />
                    </div>
                    <button
                        onClick={() => handleNumPad("0")}
                        className="h-16 rounded-xl bg-neutral-50 hover:bg-neutral-100 text-2xl font-bold text-neutral-700 transition-colors shadow-sm border border-neutral-200 active:scale-95"
                    >
                        0
                    </button>
                    <button
                        onClick={handleBackspace}
                        className="h-16 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors shadow-sm border border-red-100 active:scale-95"
                    >
                        <Delete size={24} />
                    </button>
                </div>

                <button
                    onClick={() => handleLogin()}
                    disabled={pin.length !== 4 || isAuthenticating}
                    className="w-full py-4 bg-neutral-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-neutral-900/20"
                >
                    {isAuthenticating ? <Loader2 className="animate-spin" /> : <LogIn size={20} />}
                    {isAuthenticating ? 'Validando...' : 'Entrar'}
                </button>
                </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
