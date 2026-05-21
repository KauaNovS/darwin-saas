import { Evento } from "@/types";
export interface PadraoDetectado { tipo:"recorrencia"|"loop"|"tendencia"; descricao:string; confianca:number; eventos_ids:string[]; }
export function detectarPadroes(eventos: Evento[]): PadraoDetectado[] {
  const padroes: PadraoDetectado[] = [];
  if (eventos.length < 3) return padroes;
  const emocaoCount: Record<string,string[]> = {};
  for (const ev of eventos) { if (ev.emocao) { if (!emocaoCount[ev.emocao]) emocaoCount[ev.emocao]=[]; emocaoCount[ev.emocao].push(ev.id); } }
  for (const [emocao,ids] of Object.entries(emocaoCount)) { if (ids.length>=3) padroes.push({ tipo:"recorrencia", descricao:`"${emocao}" apareceu ${ids.length} vezes nos seus registros.`, confianca:Math.min(ids.length/eventos.length,1), eventos_ids:ids }); }
  const tipoCount: Record<string,string[]> = {};
  for (const ev of eventos) { if (!tipoCount[ev.tipo]) tipoCount[ev.tipo]=[]; tipoCount[ev.tipo].push(ev.id); }
  for (const [tipo,ids] of Object.entries(tipoCount)) { if (ids.length>=4) padroes.push({ tipo:"tendencia", descricao:`Você registra muitos eventos do tipo "${tipo}" (${ids.length} ocorrências).`, confianca:Math.min(ids.length/eventos.length,1), eventos_ids:ids }); }
  const baixaEnergia = eventos.filter(ev=>ev.energia!==undefined&&ev.energia<=3);
  if (baixaEnergia.length>=3) padroes.push({ tipo:"loop", descricao:`Energia baixa detectada em ${baixaEnergia.length} registros. Avalie o que está consumindo sua energia.`, confianca:0.8, eventos_ids:baixaEnergia.map(e=>e.id) });
  const altaEnergia = eventos.filter(ev=>ev.energia!==undefined&&ev.energia>=8);
  if (altaEnergia.length>=3) padroes.push({ tipo:"tendencia", descricao:`Alta energia em ${altaEnergia.length} registros. Identifique o que gera esse estado.`, confianca:0.8, eventos_ids:altaEnergia.map(e=>e.id) });
  return padroes.sort((a,b)=>b.confianca-a.confianca).slice(0,5);
}
export function gerarQuestionamentos(eventos: Evento[]): string[] {
  const perguntas: string[] = [];
  if (eventos.length===0) return perguntas;
  const ultimo = eventos[0];
  if (ultimo.emocao) perguntas.push(`O que desencadeou "${ultimo.emocao}" no seu último registro?`);
  const tiposUnicos = [...new Set(eventos.map(e=>e.tipo))];
  if (tiposUnicos.length===1) perguntas.push(`Você só registra eventos ${tiposUnicos[0]}s. Há outros aspectos da sua vida que merecem atenção?`);
  const energias = eventos.filter(e=>e.energia!==undefined).map(e=>e.energia!);
  if (energias.length>0) { const media=energias.reduce((a,b)=>a+b,0)/energias.length; if (media<5) perguntas.push("O que você poderia mudar para aumentar sua energia média?"); else perguntas.push("O que está contribuindo para o seu bom nível de energia?"); }
  perguntas.push("Esse padrão já aconteceu antes? Em que contexto?");
  perguntas.push("Qual ação concreta você pode tomar hoje com base nesses registros?");
  return perguntas.slice(0,4);
}