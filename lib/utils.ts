import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { EventoTipo, DominioEvolutivo, ProjetoStatus } from "@/types";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export const TIPO_EVENTO_LABELS: Record<EventoTipo, string> = { emocional:"Emocional",social:"Social",cognitivo:"Cognitivo",operacional:"Operacional",biologico:"Biológico",financeiro:"Financeiro" };
export const TIPO_EVENTO_CORES: Record<EventoTipo, string> = { emocional:"bg-rose-500/20 text-rose-300 border-rose-500/30",social:"bg-sky-500/20 text-sky-300 border-sky-500/30",cognitivo:"bg-violet-500/20 text-violet-300 border-violet-500/30",operacional:"bg-amber-500/20 text-amber-300 border-amber-500/30",biologico:"bg-emerald-500/20 text-emerald-300 border-emerald-500/30",financeiro:"bg-yellow-500/20 text-yellow-300 border-yellow-500/30" };
export const DOMINIO_LABELS: Record<DominioEvolutivo, string> = { cientifico:"Científico",estrategico:"Estratégico",fisico:"Físico",social:"Social",criativo:"Criativo" };
export const DOMINIO_CORES: Record<DominioEvolutivo, string> = { cientifico:"text-blue-400",estrategico:"text-violet-400",fisico:"text-emerald-400",social:"text-sky-400",criativo:"text-pink-400" };
export const PROJETO_STATUS_LABELS: Record<ProjetoStatus, string> = { ativo:"Ativo",pausado:"Pausado",concluido:"Concluído",arquivado:"Arquivado" };
export const PROJETO_STATUS_CORES: Record<ProjetoStatus, string> = { ativo:"bg-emerald-500/20 text-emerald-300 border-emerald-500/30",pausado:"bg-amber-500/20 text-amber-300 border-amber-500/30",concluido:"bg-blue-500/20 text-blue-300 border-blue-500/30",arquivado:"bg-zinc-500/20 text-zinc-400 border-zinc-500/30" };
export const EMOCOES = ["ansiedade","calma","motivação","frustração","alegria","tristeza","raiva","orgulho","medo","esperança","entusiasmo","cansaço","satisfação","insegurança","gratidão"];
export const PROJETO_CORES = ["#6371f2","#f26371","#71f263","#f2c463","#63c4f2","#c463f2","#f26363","#63f2c4","#f2a363","#6394f2"];