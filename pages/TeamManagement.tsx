import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Role } from '../types';
import { ShieldAlert, UserPlus, Trash2, Key, User as UserIcon, ChefHat, Shield } from 'lucide-react';

export const TeamManagement: React.FC = () => {
  const { currentUser, users, addUser, removeUser } = useRestaurant();
  
  // State for new user form
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<Role>(Role.WAITER);
  const [newPin, setNewPin] = useState('');

  // Security Check: Access Control
  if (currentUser?.role !== Role.MANAGER) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <ShieldAlert size={64} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-neutral-800">Acesso Negado</h2>
        <p className="text-neutral-500 mt-2 max-w-md">
          Você não tem permissão para acessar o módulo de gestão de equipe. 
          Entre em contato com o gerente se acreditar que isso é um erro.
        </p>
      </div>
    );
  }

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPin) return;

    addUser({
      name: newName,
      role: newRole,
      pin: newPin
    });

    // Reset Form
    setNewName('');
    setNewPin('');
    setNewRole(Role.WAITER);
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case Role.MANAGER: return <Shield size={18} className="text-purple-600" />;
      case Role.CHEF: return <ChefHat size={18} className="text-orange-600" />;
      case Role.WAITER: return <UserIcon size={18} className="text-blue-600" />;
    }
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case Role.MANAGER: return 'Gerente';
      case Role.CHEF: return 'Cozinha';
      case Role.WAITER: return 'Garçom';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: List of Users */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Equipe Atual</h2>
          <p className="text-neutral-500">Gerencie o acesso e as funções dos colaboradores.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map(user => (
            <div key={user.id} className="bg-white p-5 rounded-xl shadow-sm border border-neutral-200 flex items-center justify-between group hover:border-orange-300 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full bg-neutral-50 border border-neutral-100`}>
                   {getRoleIcon(user.role)}
                </div>
                <div>
                  <h4 className="font-bold text-neutral-800">{user.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs uppercase font-bold tracking-wide text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
                      {getRoleLabel(user.role)}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono flex items-center gap-1">
                      <Key size={10} /> PIN: ••••
                    </span>
                  </div>
                </div>
              </div>
              
              {user.id !== currentUser.id && (
                <button 
                  onClick={() => removeUser(user.id)}
                  className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Remover Usuário"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Add User Form */}
      <div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-neutral-200 sticky top-24">
          <div className="flex items-center gap-2 mb-6 text-neutral-800">
            <UserPlus className="text-orange-600" />
            <h3 className="text-xl font-bold">Novo Cadastro</h3>
          </div>

          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Nome Completo</label>
              <input 
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                placeholder="Ex: João da Silva"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Função</label>
              <div className="grid grid-cols-3 gap-2">
                {[Role.WAITER, Role.CHEF, Role.MANAGER].map((role) => (
                   <button
                    key={role}
                    type="button"
                    onClick={() => setNewRole(role)}
                    className={`py-2 px-1 rounded-lg text-xs font-bold border flex flex-col items-center justify-center gap-1 transition-all ${
                      newRole === role 
                        ? 'bg-orange-600 text-white border-orange-600 shadow-md' 
                        : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'
                    }`}
                   >
                     {getRoleIcon(role)}
                     {getRoleLabel(role)}
                   </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Senha de Acesso (PIN)</label>
              <input 
                type="text" 
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g,'').slice(0,4))}
                className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all font-mono tracking-widest text-center text-lg"
                placeholder="0000"
                required
              />
              <p className="text-xs text-neutral-400 mt-1">Apenas números (4 dígitos).</p>
            </div>

            <button 
              type="submit" 
              className="w-full bg-neutral-900 text-white py-3 rounded-xl font-bold hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-900/20 mt-4 flex items-center justify-center gap-2"
            >
              <UserPlus size={18} /> Cadastrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};