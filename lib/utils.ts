import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function getIntensityColor(v: number): string {
  if (v <= 3) return '#ef4444';
  if (v <= 6) return '#f59e0b';
  return '#22c55e';
}

export const EMOCOES_DEFAULT = [
  'Alegria','Gratidão','Motivação','Amor','Esperança','Serenidade',
  'Curiosidade','Entusiasmo','Confiança','Satisfação',
  'Tristeza','Ansiedade','Raiva','Medo','Frustração','Culpa',
  'Vergonha','Solidão','Inveja','Tédio','Confusão','Desânimo'
];

export const DOMINIO_TIPOS_DEFAULT: Record<string, string[]> = {
  cientifico: ['Análise','Pesquisa','Experimentação','Raciocínio Lógico'],
  estrategico: ['Planejamento','Tomada de Decisão','Liderança','Estratégia'],
  fisico: ['Energia Corporal','Exercício','Saúde','Recuperação'],
  social: ['Comunicação','Relacionamento','Empatia','Colaboração'],
  criativo: ['Criatividade','Inovação','Expressão Artística','Design'],
  mental: ['Foco','Clareza Mental','Aprendizado','Memória'],
  financeiro: ['Gestão Financeira','Investimento','Economia','Produtividade'],
  espiritual: ['Meditação','Propósito','Valores','Consciência'],
};

export const DOMINIOS = [
  { value: 'cientifico', label: '🔬 Científico' },
  { value: 'estrategico', label: '🎯 Estratégico' },
  { value: 'fisico', label: '💪 Físico' },
  { value: 'social', label: '👥 Social' },
  { value: 'criativo', label: '🎨 Criativo' },
  { value: 'mental', label: '🧠 Mental' },
  { value: 'financeiro', label: '💰 Financeiro' },
  { value: 'espiritual', label: '✨ Espiritual' },
];

export const PROJETO_CORES = [
  '#6e56ff','#ec4899','#22c55e','#f59e0b','#3b82f6',
  '#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16'
];

export type ProjetoStatus = 'ativo' | 'pausado' | 'concluido' | 'arquivado';
export type DominioEvolutivo = 'cientifico' | 'estrategico' | 'fisico' | 'social' | 'criativo' | 'mental' | 'financeiro' | 'espiritual';
