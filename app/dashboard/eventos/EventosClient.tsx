'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn, getIntensityColor, EMOCOES_DEFAULT, DOMINIOS, DOMINIO_TIPOS_DEFAULT } from '@/lib/utils';
import type { Evento, EmocaoItem, DominioItem } from '@/types';

const TIPOS_EVENTO = ['emocional','social','cognitivo','operacional','biologico','financeiro'];

function IntensityBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(value/10)*100}%`, backgroundColor: color }} />
    </div>
  );
}

function EmocaoCard({ item, idx, onChange, onRemove, catalogoEmocoes }: {
  item: EmocaoItem; idx: number;
  onChange: (idx: number, field: keyof EmocaoItem, val: string | number) => void;
  onRemove: (idx: number) => void;
  catalogoEmocoes: string[];
}) {
  const color = getIntensityColor(item.intensidade);
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <select value={item.emocao_nome} onChange={e => onChange(idx,'emocao_nome',e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500">
          <option value="">Selecionar emoção...</option>
          {catalogoEmocoes.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <button onClick={() => onRemove(idx)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors">
          <X size={14} />
        </button>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-white/50">Intensidade</span>
          <span style={{ color }} className="font-bold">{item.intensidade}/10</span>
        </div>
        <IntensityBar value={item.intensidade} color={color} />
        <input type="range" min={1} max={10} value={item.intensidade}
          onChange={e => onChange(idx,'intensidade',parseInt(e.target.value))}
          className="w-full h-1 appearance-none cursor-pointer" />
      </div>
      <input value={item.observacao||''} onChange={e => onChange(idx,'observacao',e.target.value)}
        placeholder="Observação opcional..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-purple-500" />
    </div>
  );
}

function DominioCard({ item, idx, onChange, onRemove, tiposPorDominio }: {
  item: DominioItem; idx: number;
  onChange: (idx: number, field: keyof DominioItem, val: string | number) => void;
  onRemove: (idx: number) => void;
  tiposPorDominio: Record<string, string[]>;
}) {
  const color = getIntensityColor(item.intensidade);
  const tipos = item.dominio ? (tiposPorDominio[item.dominio] || []) : [];
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <select value={item.dominio} onChange={e => { onChange(idx,'dominio',e.target.value); onChange(idx,'tipo_nome',''); }}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500">
          <option value="">Selecionar domínio...</option>
          {DOMINIOS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
        <button onClick={() => onRemove(idx)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors">
          <X size={14} />
        </button>
      </div>
      {item.dominio && (
        <select value={item.tipo_nome||''} onChange={e => onChange(idx,'tipo_nome',e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500">
          <option value="">Selecionar tipo...</option>
          {tipos.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      )}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-white/50">Intensidade</span>
          <span style={{ color }} className="font-bold">{item.intensidade}/10</span>
        </div>
        <IntensityBar value={item.intensidade} color={color} />
        <input type="range" min={1} max={10} value={item.intensidade}
          onChange={e => onChange(idx,'intensidade',parseInt(e.target.value))}
          className="w-full h-1 appearance-none cursor-pointer" />
      </div>
      <input value={item.descricao||''} onChange={e => onChange(idx,'descricao',e.target.value)}
        placeholder="Descrição opcional..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-purple-500" />
    </div>
  );
}

export default function EventosClient() {
  const supabase = createClient();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [catalogoEmocoes, setCatalogoEmocoes] = useState<string[]>(EMOCOES_DEFAULT);
  const [tiposPorDominio, setTiposPorDominio] = useState<Record<string,string[]>>(DOMINIO_TIPOS_DEFAULT);

  const [form, setForm] = useState({
    titulo: '', descricao: '', tipo: 'emocional', energia: 5, local: '', projeto_id: '', tags: ''
  });
  const [emocoes, setEmocoes] = useState<EmocaoItem[]>([]);
  const [dominios, setDominios] = useState<DominioItem[]>([]);

  useEffect(() => { fetchEventos(); fetchCatalogos(); }, []);

  async function fetchCatalogos() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { data: emoData } = await supabase.from('emocoes_catalogo').select('nome').eq('user_id', user.user.id);
    if (emoData && emoData.length > 0) {
      const extras = emoData.map((e: { nome: string }) => e.nome).filter((n: string) => !EMOCOES_DEFAULT.includes(n));
      setCatalogoEmocoes([...EMOCOES_DEFAULT, ...extras]);
    }
    const { data: tiposData } = await supabase.from('dominio_tipos').select('nome,dominio').eq('user_id', user.user.id);
    if (tiposData && tiposData.length > 0) {
      const extra: Record<string,string[]> = { ...DOMINIO_TIPOS_DEFAULT };
      tiposData.forEach((t: { nome: string; dominio: string }) => {
        if (!extra[t.dominio]) extra[t.dominio] = [];
        if (!extra[t.dominio].includes(t.nome)) extra[t.dominio].push(t.nome);
      });
      setTiposPorDominio(extra);
    }
  }

  async function fetchEventos() {
    setLoading(true);
    const { data } = await supabase.from('eventos').select('*').order('created_at', { ascending: false });
    setEventos(data || []);
    setLoading(false);
  }

  function addEmocao() { setEmocoes(prev => [...prev, { emocao_nome: '', intensidade: 5, observacao: '' }]); }
  function removeEmocao(idx: number) { setEmocoes(prev => prev.filter((_,i) => i !== idx)); }
  function changeEmocao(idx: number, field: keyof EmocaoItem, val: string | number) {
    setEmocoes(prev => prev.map((e, i) => i === idx ? { ...e, [field]: val } : e));
  }
  function addDominio() { setDominios(prev => [...prev, { dominio: '', tipo_nome: '', intensidade: 5, descricao: '' }]); }
  function removeDominio(idx: number) { setDominios(prev => prev.filter((_,i) => i !== idx)); }
  function changeDominio(idx: number, field: keyof DominioItem, val: string | number) {
    setDominios(prev => prev.map((d, i) => i === idx ? { ...d, [field]: val } : d));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data: evento, error } = await supabase.from('eventos').insert({
      user_id: userData.user.id,
      titulo: form.titulo, descricao: form.descricao, tipo: form.tipo,
      energia: form.energia, local: form.local,
      projeto_id: form.projeto_id || null,
      emocao: emocoes[0]?.emocao_nome || null,
      dominio: dominios[0]?.dominio || null,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }).select().single();

    if (!error && evento) {
      if (emocoes.length > 0) {
        const emocoesValidas = emocoes.filter(e => e.emocao_nome);
        if (emocoesValidas.length > 0) {
          await supabase.from('evento_emocoes').insert(
            emocoesValidas.map(e => ({ evento_id: evento.id, user_id: userData.user!.id, ...e }))
          );
        }
      }
      if (dominios.length > 0) {
        const dominiosValidos = dominios.filter(d => d.dominio);
        if (dominiosValidos.length > 0) {
          await supabase.from('evento_dominios').insert(
            dominiosValidos.map(d => ({ evento_id: evento.id, user_id: userData.user!.id, ...d }))
          );
        }
      }
    }

    setSaving(false);
    setShowForm(false);
    setForm({ titulo: '', descricao: '', tipo: 'emocional', energia: 5, local: '', projeto_id: '', tags: '' });
    setEmocoes([]); setDominios([]);
    fetchEventos();
  }

  async function deleteEvento(id: string) {
    await supabase.from('evento_emocoes').delete().eq('evento_id', id);
    await supabase.from('evento_dominios').delete().eq('evento_id', id);
    await supabase.from('eventos').delete().eq('id', id);
    fetchEventos();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Eventos</h1>
          <p className="text-white/50 text-sm mt-1">Registre seus eventos contextuais</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus size={16} />
          {showForm ? 'Cancelar' : 'Novo evento'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Registrar evento</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs text-white/50 mb-1 block">Título *</label>
              <input required value={form.titulo} onChange={e => setForm(p => ({...p, titulo: e.target.value}))}
                placeholder="O que aconteceu?" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Tipo</label>
              <select value={form.tipo} onChange={e => setForm(p => ({...p, tipo: e.target.value}))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500">
                {TIPOS_EVENTO.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Local</label>
              <input value={form.local} onChange={e => setForm(p => ({...p, local: e.target.value}))}
                placeholder="Onde?" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-purple-500" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Energia geral</span>
                <span style={{ color: getIntensityColor(form.energia) }} className="font-bold">{form.energia}/10</span>
              </div>
              <IntensityBar value={form.energia} color={getIntensityColor(form.energia)} />
              <input type="range" min={1} max={10} value={form.energia}
                onChange={e => setForm(p => ({...p, energia: parseInt(e.target.value)}))}
                className="w-full h-1 appearance-none cursor-pointer" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-white/50 mb-1 block">Descrição</label>
              <textarea value={form.descricao} onChange={e => setForm(p => ({...p, descricao: e.target.value}))}
                placeholder="Descreva o contexto..." rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-purple-500 resize-none" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-white/50 mb-1 block">Tags (separadas por vírgula)</label>
              <input value={form.tags} onChange={e => setForm(p => ({...p, tags: e.target.value}))}
                placeholder="trabalho, pessoal, urgente..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-purple-500" />
            </div>
          </div>

          {/* Seção de Emoções */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/80">💜 Emoções</h3>
              <button type="button" onClick={addEmocao}
                className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-lg transition-colors">
                <Plus size={12} /> Adicionar emoção
              </button>
            </div>
            {emocoes.length === 0 && (
              <p className="text-xs text-white/30 text-center py-4 border border-dashed border-white/10 rounded-xl">
                Nenhuma emoção adicionada. Clique em &quot;Adicionar emoção&quot; para começar.
              </p>
            )}
            {emocoes.map((e, i) => (
              <EmocaoCard key={i} item={e} idx={i} onChange={changeEmocao} onRemove={removeEmocao} catalogoEmocoes={catalogoEmocoes} />
            ))}
          </div>

          {/* Seção de Domínios */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/80">🌐 Domínios</h3>
              <button type="button" onClick={addDominio}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors">
                <Plus size={12} /> Adicionar domínio
              </button>
            </div>
            {dominios.length === 0 && (
              <p className="text-xs text-white/30 text-center py-4 border border-dashed border-white/10 rounded-xl">
                Nenhum domínio adicionado. Clique em &quot;Adicionar domínio&quot; para começar.
              </p>
            )}
            {dominios.map((d, i) => (
              <DominioCard key={i} item={d} idx={i} onChange={changeDominio} onRemove={removeDominio} tiposPorDominio={tiposPorDominio} />
            ))}
          </div>

          <button type="submit" disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-colors">
            {saving ? <><Loader2 size={16} className="animate-spin" /> Salvando...</> : 'Salvar evento'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-purple-500" size={24} /></div>
      ) : eventos.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <p className="text-lg">Nenhum evento registrado</p>
          <p className="text-sm mt-1">Clique em &quot;Novo evento&quot; para começar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {eventos.map(ev => (
            <div key={ev.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-medium text-sm">{ev.titulo}</span>
                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">{ev.tipo}</span>
                    {ev.energia && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: getIntensityColor(ev.energia)+'20', color: getIntensityColor(ev.energia) }}>
                        ⚡ {ev.energia}/10
                      </span>
                    )}
                  </div>
                  {ev.descricao && <p className="text-white/50 text-xs mt-1 line-clamp-2">{ev.descricao}</p>}
                  {ev.local && <p className="text-white/30 text-xs mt-1">📍 {ev.local}</p>}
                  {ev.tags && ev.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-2">
                      {ev.tags.map(t => <span key={t} className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded-full">#{t}</span>)}
                    </div>
                  )}
                  <p className="text-white/20 text-xs mt-2">{new Date(ev.created_at).toLocaleString('pt-BR')}</p>
                </div>
                <button onClick={() => deleteEvento(ev.id)} className="text-white/20 hover:text-red-400 transition-colors flex-shrink-0">
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
