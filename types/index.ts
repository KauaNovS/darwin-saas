export type EventoTipo = "emocional"|"social"|"cognitivo"|"operacional"|"biologico"|"financeiro";
export type DominioEvolutivo = "cientifico"|"estrategico"|"fisico"|"social"|"criativo";
export type ProjetoStatus = "ativo"|"pausado"|"concluido"|"arquivado";
export interface Evento { id:string; user_id:string; titulo:string; descricao?:string; tipo:EventoTipo; emocao?:string; energia?:number; local?:string; projeto_id?:string; dominio?:DominioEvolutivo; impactos?:string[]; tags?:string[]; created_at:string; updated_at:string; }
export interface Projeto { id:string; user_id:string; nome:string; descricao?:string; status:ProjetoStatus; dominio?:DominioEvolutivo; meta?:string; progresso?:number; cor?:string; created_at:string; updated_at:string; }