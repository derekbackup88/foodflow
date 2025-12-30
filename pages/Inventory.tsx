import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { AlertTriangle, Package, PlusCircle, Trash2, Edit2, Save, X, RotateCcw } from 'lucide-react';
import { Role } from '../types';

export const Inventory: React.FC = () => {
  const { ingredients, currentUser, addIngredient, updateIngredient, removeIngredient } = useRestaurant();
  
  // Permissions Check
  const canEdit = currentUser?.role === Role.MANAGER || currentUser?.role === Role.CHEF;

  // Form State
  const [isEditing, setIsEditing] = useState<string | null>(null); // ID of item being edited
  const [formData, setFormData] = useState({
    name: '',
    unit: 'un',
    currentStock: '',
    minStockLevel: '',
    costPerUnit: ''
  });

  // Edit State (Temporary holder for row editing)
  const [editData, setEditData] = useState<any>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.currentStock) return;

    addIngredient({
      name: formData.name,
      unit: formData.unit,
      currentStock: parseFloat(formData.currentStock),
      minStockLevel: parseFloat(formData.minStockLevel) || 0,
      costPerUnit: parseFloat(formData.costPerUnit) || 0
    });

    setFormData({
      name: '',
      unit: 'un',
      currentStock: '',
      minStockLevel: '',
      costPerUnit: ''
    });
  };

  const startEdit = (ingredient: any) => {
    setIsEditing(ingredient.id);
    setEditData(ingredient);
  };

  const saveEdit = () => {
    if (isEditing && editData) {
      updateIngredient(isEditing, {
        name: editData.name,
        currentStock: Number(editData.currentStock),
        minStockLevel: Number(editData.minStockLevel),
        costPerUnit: Number(editData.costPerUnit),
        unit: editData.unit
      });
      setIsEditing(null);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-140px)]">
      
      {/* Lista de Ingredientes (Tabela) */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-neutral-200 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-neutral-800">Estoque Atual</h2>
                <p className="text-sm text-neutral-500">Monitoramento e reposição.</p>
            </div>
            {canEdit && (
                <div className="text-xs font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                    Modo Edição Ativo
                </div>
            )}
        </div>
        
        <div className="flex-1 overflow-auto">
            <table className="w-full text-left">
                <thead className="bg-white border-b border-neutral-200 sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Ingrediente</th>
                        <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Estoque</th>
                        <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Mínimo</th>
                        <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Custo (R$)</th>
                        <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                        {canEdit && <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Ações</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                    {ingredients.map(ing => {
                        const isLow = ing.currentStock <= ing.minStockLevel;
                        const isRowEditing = isEditing === ing.id;

                        if (isRowEditing) {
                            return (
                                <tr key={ing.id} className="bg-orange-50">
                                    <td className="px-6 py-4">
                                        <input 
                                            value={editData.name} 
                                            onChange={(e) => setEditData({...editData, name: e.target.value})}
                                            className="w-full p-1 border rounded"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1">
                                            <input 
                                                type="number" 
                                                value={editData.currentStock} 
                                                onChange={(e) => setEditData({...editData, currentStock: e.target.value})}
                                                className="w-20 p-1 border rounded"
                                            />
                                            <span className="text-xs text-neutral-500">{ing.unit}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input 
                                            type="number" 
                                            value={editData.minStockLevel} 
                                            onChange={(e) => setEditData({...editData, minStockLevel: e.target.value})}
                                            className="w-16 p-1 border rounded"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            value={editData.costPerUnit} 
                                            onChange={(e) => setEditData({...editData, costPerUnit: e.target.value})}
                                            className="w-20 p-1 border rounded"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-xs text-orange-600 font-bold">Editando...</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={saveEdit} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"><Save size={16} /></button>
                                            <button onClick={() => setIsEditing(null)} className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200"><X size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }

                        return (
                            <tr key={ing.id} className="hover:bg-neutral-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-neutral-100 rounded-lg text-neutral-400 group-hover:text-orange-500 transition-colors">
                                            <Package size={18} />
                                        </div>
                                        <span className="font-medium text-neutral-700">{ing.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-mono text-neutral-600 font-medium">{ing.currentStock.toFixed(2)}</span>
                                    <span className="text-xs text-neutral-400 ml-1">{ing.unit}</span>
                                </td>
                                <td className="px-6 py-4 text-neutral-500">
                                    {ing.minStockLevel} {ing.unit}
                                </td>
                                <td className="px-6 py-4 text-neutral-600">
                                    R$ {ing.costPerUnit.toFixed(2)}
                                </td>
                                <td className="px-6 py-4">
                                    {isLow ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                            <AlertTriangle size={12} /> Crítico
                                        </span>
                                    ) : (
                                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                                            OK
                                        </span>
                                    )}
                                </td>
                                {canEdit && (
                                    <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => startEdit(ing)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => removeIngredient(ing.id)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                                                title="Remover"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>

      {/* Formulário de Cadastro (Lateral) */}
      {canEdit && (
          <div className="w-full xl:w-[350px] flex flex-col gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
                <div className="flex items-center gap-2 mb-6 text-neutral-800">
                    <div className="p-2 bg-neutral-900 rounded-lg text-white">
                        <PlusCircle size={20} />
                    </div>
                    <h3 className="text-lg font-bold">Novo Insumo</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Nome do Item</label>
                        <input 
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                            placeholder="Ex: Farinha de Trigo"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Unidade</label>
                             <select 
                                name="unit"
                                value={formData.unit}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border border-neutral-300 bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                             >
                                <option value="un">Unidade (un)</option>
                                <option value="kg">Quilos (kg)</option>
                                <option value="l">Litros (l)</option>
                                <option value="pct">Pacote (pct)</option>
                                <option value="fatia">Fatia</option>
                             </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Estoque Inicial</label>
                            <input 
                                type="number" 
                                name="currentStock"
                                step="any"
                                value={formData.currentStock}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="0"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Estoque Mínimo</label>
                            <input 
                                type="number" 
                                name="minStockLevel"
                                step="any"
                                value={formData.minStockLevel}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="Alerta em..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Custo (Unit)</label>
                            <input 
                                type="number" 
                                name="costPerUnit"
                                step="0.01"
                                value={formData.costPerUnit}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="R$ 0.00"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-neutral-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-colors shadow-lg shadow-neutral-900/20 mt-2 flex items-center justify-center gap-2"
                    >
                        <Save size={18} /> Salvar Insumo
                    </button>
                </form>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <div className="flex items-start gap-3">
                    <RotateCcw className="text-blue-600 mt-1" size={20} />
                    <div>
                        <h4 className="font-bold text-blue-900 text-sm">Dica de Gestão</h4>
                        <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                            Mantenha o "Estoque Mínimo" atualizado para receber alertas automáticos no Painel Principal quando for hora de reabastecer.
                        </p>
                    </div>
                </div>
            </div>
          </div>
      )}
    </div>
  );
};