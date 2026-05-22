export interface Evento {
  id: string; user_id: string; titulo: string; descricao?: string;
  tipo: string; emocao?: string; energia?: number; local?: string;
  projeto_id?: string; dominio?: string; impactos?: string[]; tags?: string[];
  created_at: string; updated_at: string;
}
export interface EmocaoItem { emocao_nome: string; intensidade: number; observacao?: string; }
export interface DominioItem { dominio: string; tipo_nome?: string; intensidade: number; descricao?: string; }
export interface EmocaoCatalogo { id: string; user_id: string; nome: string; descricao?: string; cor?: string; created_at: string; }
export interface DominioTipo { id: string; user_id: string; nome: string; descricao?: string; dominio: string; identificador: string; created_at: string; }
export interface Projeto {
  id: string; user_id: string; nome: string; descricao?: string;
  status: string; dominio?: string; meta?: string; progresso?: number; cor?: string;
  created_at: string; updated_at: string;
}
export interface Insight { id: string; user_id: string; conteudo: string; tipo: string; fonte?: string; evento_ids?: string[]; created_at: string; }
