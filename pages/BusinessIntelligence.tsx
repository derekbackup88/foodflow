import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Sparkles, TrendingUp, Users, AlertCircle, ArrowRight } from 'lucide-react';

export const BusinessIntelligence: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  // Simulating the call to Gemini API with the System Prompt provided
  const generateAnalysis = () => {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setAnalysis({
        promotions: [
          {
            dish: "Cheeseburger Duplo",
            reason: "Excesso de estoque de Pão de Hambúrguer (150% acima do mínimo) e Queijo (120% acima).",
            action: "Criar combo 'Terça do Burger' com 15% de desconto."
          },
          {
            dish: "Batata Frita Especial",
            reason: "Estoque de Batata próximo do vencimento simulado e alto volume em estoque.",
            action: "Oferecer como acompanhamento gratuito para pedidos acima de R$ 50,00."
          }
        ],
        staffing: {
          days: ["Sexta-feira", "Sábado"],
          timeSlot: "19:00 - 22:30",
          reason: "Análise histórica mostra aumento de 40% no volume de pedidos simultâneos nesta janela.",
          recommendation: "Adicionar 1 Garçom extra e 1 Auxiliar de Cozinha."
        },
        forecast: {
          range: "R$ 15.200,00 - R$ 16.800,00",
          trend: "Crescimento de 5% em relação à semana anterior.",
          insight: "Aumento gradual no ticket médio observado nos últimos 3 dias."
        }
      });
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-neutral-800 flex items-center gap-2">
            <BrainCircuitIcon className="text-purple-600" />
            Inteligência Artificial
          </h2>
          <p className="text-neutral-500 mt-2 max-w-2xl">
            Utilizando o modelo <strong>Gemini 2.5 Pro</strong> para analisar seus dados de vendas e estoque. 
            Obtenha insights sobre promoções, escala de equipe e previsão financeira.
          </p>
        </div>
        <button
          onClick={generateAnalysis}
          disabled={isLoading}
          className={`px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center gap-2 ${
            isLoading 
              ? 'bg-neutral-400 cursor-not-allowed' 
              : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200 hover:scale-105 active:scale-95'
          }`}
        >
          {isLoading ? (
            <>Processando dados...</>
          ) : (
            <><Sparkles size={18} /> Gerar Análise Semanal</>
          )}
        </button>
      </div>

      {!analysis && !isLoading && (
        <div className="bg-white border-2 border-dashed border-neutral-300 rounded-2xl p-12 text-center text-neutral-400">
          <BrainCircuitIcon size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Nenhuma análise gerada ainda.</p>
          <p className="text-sm">Clique no botão acima para processar os dados da semana.</p>
        </div>
      )}

      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Card 1: Promoções */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 md:col-span-2 border-l-4 border-l-emerald-500">
            <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2 mb-4">
              <TrendingUp className="text-emerald-600" size={20} />
              Oportunidades de Promoção (Estoque)
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {analysis.promotions.map((promo: any, idx: number) => (
                <div key={idx} className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-emerald-900 text-lg">{promo.dish}</span>
                    <span className="bg-white text-emerald-700 text-xs px-2 py-1 rounded font-bold border border-emerald-200">Sugestão</span>
                  </div>
                  <p className="text-sm text-emerald-800 mb-2"><strong>Motivo:</strong> {promo.reason}</p>
                  <p className="text-sm text-emerald-700 flex items-center gap-1">
                    <ArrowRight size={14} /> {promo.action}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Staffing */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 border-l-4 border-l-orange-500">
            <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2 mb-4">
              <Users className="text-orange-600" size={20} />
              Otimização de Escala
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-orange-50 p-3 rounded-lg">
                <span className="text-sm text-orange-800 font-medium">Dias Críticos</span>
                <span className="font-bold text-orange-900">{analysis.staffing.days.join(" & ")}</span>
              </div>
              <div className="flex justify-between items-center bg-orange-50 p-3 rounded-lg">
                <span className="text-sm text-orange-800 font-medium">Horário de Pico</span>
                <span className="font-bold text-orange-900">{analysis.staffing.timeSlot}</span>
              </div>
              <p className="text-sm text-neutral-600 mt-2 italic">"{analysis.staffing.recommendation}"</p>
            </div>
          </div>

          {/* Card 3: Forecast */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 border-l-4 border-l-blue-500">
            <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2 mb-4">
              <AlertCircle className="text-blue-600" size={20} />
              Previsão de Faturamento
            </h3>
            <div className="text-center py-4">
              <p className="text-sm text-neutral-500 mb-1">Próxima Semana (Estimado)</p>
              <p className="text-3xl font-black text-neutral-900 tracking-tight">{analysis.forecast.range}</p>
              <span className="inline-block mt-3 px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                {analysis.forecast.trend}
              </span>
            </div>
            <p className="text-xs text-neutral-500 text-center mt-2 border-t border-neutral-100 pt-2">
              Baseado em regressão linear dos últimos 30 dias.
            </p>
          </div>

        </div>
      )}
    </div>
  );
};

const BrainCircuitIcon = ({ size = 24, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
    <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
    <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
    <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
    <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
    <path d="M6 18a4 4 0 0 1-1.97-3.284" />
    <path d="M17.97 14.716A4 4 0 0 1 16 18" />
  </svg>
);