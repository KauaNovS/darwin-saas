'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Check, Loader2, Plus, ChevronDown } from 'lucide-react';

// Paleta de cores por categoria
const CAT = {
  emocao:       { label:'Emoção',        emoji:'💜', color:'#7b61ff', bg:'rgba(123,97,255,0.12)' },
  sensacao:     { label:'Sensação',      emoji:'🌊', color:'#fb923c', bg:'rgba(251,146,60,0.12)' },
  pensamento:   { label:'Pensamento',    emoji:'🧠', color:'#38bdf8', bg:'rgba(56,189,248,0.12)' },
  comportamento:{ label:'Comportamento', emoji:'🔄', color:'#ef4444', bg:'rgba(239,68,68,0.12)'  },
  evento:       { label:'Evento',        emoji:'📌', color:'#f472b6', bg:'rgba(244,114,182,0.12)'},
  atividade:    { label:'Atividade',     emoji:'⚡', color:'#2dd4bf', bg:'rgba(45,212,191,0.12)' },
  sono:         { label:'Sono',          emoji:'🌙', color:'#818cf8', bg:'rgba(129,140,248,0.12)'},
  memoria:      { label:'Memória',       emoji:'🕰️', color:'#f9a8d4', bg:'rgba(249,168,212,0.12)'},
};

// Emoções por valência
const EMOCOES = {
  positivas: ['Alegria','Gratidão','Amor','Motivação','Entusiasmo','Esperança','Serenidade','Confiança','Satisfação','Orgulho','Alívio','Empolgação','Conexão','Inspiração','Plenitude'],
  negativas: ['Ansiedade','Tristeza','Raiva','Medo','Frustração','Culpa','Vergonha','Solidão','Desânimo','Exaustão','Insegurança','Ressentimento','Angústia','Estresse','Vazio'],
  neutras:   ['Curiosidade','Surpresa','Expectativa','Cautela','Indiferença','Reflexão','Observação','Dúvida','Adaptação','Presença'],
};

const EMOCAO_COLOR: Record<string,string> = {
  positivas:'#4ade80', negativas:'#f87171', neutras:'#818cf8'
};

function IntBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.07)' }}>
      <div className="h-full rounded-full transition-all duration-300" style={{ width:`${value*10}%`, background:color }} />
    </div>
  );
}

interface EmocaoSel { nome: string; intensidade: number; valence: string; }

export default function QuickRegister({ onSaved }: { onSaved?: () => void }) {
  const supabase = createClient();
  const [categoria, setCategoria] = useState<string>('emocao');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [intensidade, setIntensidade] = useState(5);
  const [adaptativo, setAdaptativo] = useState<boolean|null>(null);
  const [emocoesSel, setEmocoesSel] = useState<EmocaoSel[]>([]);
  const [pickEmo, setPickEmo] = useState<string|null>(null); // emoção sendo configurada
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showEmoGrid, setShowEmoGrid] = useState(false);
  const [emoInt, setEmoInt] = useState(5);

  const cat = CAT[categoria];

  function addEmocao(nome: string, valence: string) {
    if (emocoesSel.find(e => e.nome === nome)) {
      setEmocoesSel(prev => prev.filter(e => e.nome !== nome));
    } else {
      setPickEmo(nome);
      setEmoInt(5);
      // setShowEmoGrid(false); -- keep grid open to show selection
    }
  }

  function confirmEmocao() {
    if (!pickEmo) return;
    const valence = Object.entries(EMOCOES).find(([,items]) => items.includes(pickEmo))?.[0] || 'neutras';
    setEmocoesSel(prev => {
      const existing = prev.find(e => e.nome === pickEmo);
      if (existing) return prev.map(e => e.nome === pickEmo ? {...e, intensidade:emoInt} : e);
      return [...prev, { nome: pickEmo, intensidade: emoInt, valence }];
    });
    setPickEmo(null);
  }

  async function handleSave() {
    if (!titulo.trim() && emocoesSel.length === 0) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: reg } = await supabase.from('registros').insert({
      user_id: user.id,
      categoria,
      titulo: titulo || emocoesSel.map(e => e.nome).join(', '),
      descricao,
      intensidade,
      adaptativo,
      meta: { emocoes: emocoesSel },
    }).select().single();

    // salvar itens de emoção individualmente
    if (reg && emocoesSel.length > 0) {
      await supabase.from('registro_itens').insert(
        emocoesSel.map(e => ({ registro_id: reg.id, user_id: user.id, nome: e.nome, intensidade: e.intensidade }))
      );
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setTitulo(''); setDescricao(''); setIntensidade(5); setAdaptativo(null);
      setEmocoesSel([]); setPickEmo(null); setShowEmoGrid(false);
      onSaved?.();
    }, 1200);
  }

  const canSave = titulo.trim().length > 0 || emocoesSel.length > 0;
  const intColor = intensidade <= 3 ? '#ef4444' : intensidade <= 6 ? '#f59e0b' : '#22c55e';

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background:'var(--bg2)', borderColor:'var(--border2)' }}>
      {/* Categoria tabs */}
      <div className="flex overflow-x-auto border-b" style={{ borderColor:'var(--border)' }}>
        {Object.entries(CAT).map(([key, c]) => (
          <button key={key} onClick={() => { setCategoria(key); setShowEmoGrid(false); setEmocoesSel([]); }}
            className="flex items-center gap-1.5 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all flex-shrink-0"
            style={{
              borderBottomColor: categoria === key ? c.color : 'transparent',
              color: categoria === key ? c.color : 'var(--text3)',
              background: categoria === key ? c.bg : 'transparent',
            }}>
            <span>{c.emoji}</span> {c.label}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-4">
        {/* Título */}
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest" style={{ color:'var(--text3)' }}>
            {categoria === 'emocao' ? 'O que está sentindo?' : categoria === 'pensamento' ? 'Qual o pensamento?' : categoria === 'evento' ? 'O que aconteceu?' : categoria === 'atividade' ? 'Que atividade foi?' : 'Título'}
          </label>
          <input value={titulo} onChange={e => setTitulo(e.target.value)}
            placeholder={
              categoria === 'emocao' ? 'Ex: Ansiedade antes da reunião...' :
              categoria === 'pensamento' ? 'Ex: Achei que ia falhar na apresentação...' :
              categoria === 'evento' ? 'Ex: Discussão com colega de trabalho...' :
              categoria === 'atividade' ? 'Ex: Corrida de 5km no parque...' :
              'Descreva brevemente...'
            }
            className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
            style={{ background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', color:'var(--text)' }}
            onFocus={e => e.target.style.borderColor = cat.color}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Emoções (somente categoria emocao) */}
        {categoria === 'emocao' && (
          <div className="space-y-3">
            {/* Chips selecionadas */}
            {emocoesSel.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {emocoesSel.map(e => {
                  const valColor = EMOCAO_COLOR[e.valence] || '#818cf8';
                  return (
                    <div key={e.nome} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer"
                      style={{ background:valColor+'18', border:`1px solid ${valColor}35`, color:valColor }}
                      onClick={() => { setPickEmo(e.nome); setEmoInt(e.intensidade); }}>
                      {e.nome}
                      <span className="opacity-60">· {e.intensidade}</span>
                      <span onClick={ev => { ev.stopPropagation(); setEmocoesSel(p=>p.filter(x=>x.nome!==e.nome)); }}
                        className="ml-0.5 opacity-50 hover:opacity-100 cursor-pointer">×</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Botão para abrir grid */}
            <button onClick={() => setShowEmoGrid(s => !s)}
              className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl transition-all"
              style={{ background:cat.bg, color:cat.color, border:`1px solid ${cat.color}35` }}>
              <Plus size={13} /> Adicionar emoção
              <ChevronDown size={12} className={`transition-transform ${showEmoGrid ? 'rotate-180' : ''}`} />
            </button>

            {showEmoGrid && (
              <div className="rounded-xl border p-3 space-y-3" style={{ background:'rgba(255,255,255,0.02)', borderColor:'var(--border)' }}>
                {Object.entries(EMOCOES).map(([valence, items]) => {
                  const vc = EMOCAO_COLOR[valence];
                  return (
                    <div key={valence}>
                      <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color:vc }}>
                        {valence === 'positivas' ? '↑ Positivas' : valence === 'negativas' ? '↓ Negativas' : '· Neutras'}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {items.map(nome => {
                          const isSel = emocoesSel.some(e => e.nome === nome);
                          return (
                            <button key={nome} onClick={() => addEmocao(nome, valence)}
                              className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                              style={{
                                border:`1px solid ${vc}35`,
                                background: isSel ? vc+'25' : vc+'06',
                                color: isSel ? vc : vc+'80',
                                fontWeight: isSel ? '700' : '600',
                              }}>
                              {nome}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Intensidade da emoção sendo configurada */}
            {pickEmo && (
              <div className="rounded-xl border p-3 space-y-2" style={{ background:cat.bg, borderColor:cat.color+'35' }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold" style={{ color:cat.color }}>{pickEmo}</span>
                  <span className="text-xs font-bold" style={{ color:cat.color }}>{emoInt}/10</span>
                </div>
                <IntBar value={emoInt} color={cat.color} />
                <div className="flex gap-1.5">
                  {[1,2,3,4,5,6,7,8,9,10].map(v => (
                    <button key={v} onClick={() => setEmoInt(v)}
                      className="flex-1 h-8 rounded-lg text-xs font-bold transition-all"
                      style={{
                        border: `1px solid ${emoInt===v ? cat.color : 'var(--border)'}`,
                        background: emoInt===v ? cat.color+'25' : 'rgba(255,255,255,0.02)',
                        color: emoInt===v ? cat.color : 'var(--text3)',
                      }}>
                      {v}
                    </button>
                  ))}
                </div>
                <button onClick={confirmEmocao}
                  className="w-full py-2 rounded-xl text-xs font-bold transition-all"
                  style={{ background:cat.color, color:'#fff' }}>
                  Confirmar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Intensidade geral */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-widest" style={{ color:'var(--text3)' }}>Intensidade</label>
            <span className="text-xs font-bold" style={{ color:intColor }}>{intensidade}/10</span>
          </div>
          <IntBar value={intensidade} color={intColor} />
          <input type="range" min={1} max={10} value={intensidade}
            onChange={e => setIntensidade(parseInt(e.target.value))}
            className="w-full h-1 cursor-pointer appearance-none"
            style={{ accentColor:intColor }} />
          <div className="flex justify-between text-xs" style={{ color:'var(--text3)' }}>
            <span>Leve</span><span>Moderado</span><span>Intenso</span>
          </div>
        </div>

        {/* Adaptativo (comportamento, pensamento) */}
        {(categoria === 'comportamento' || categoria === 'pensamento') && (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest" style={{ color:'var(--text3)' }}>Classificação</label>
            <div className="flex gap-2">
              <button onClick={() => setAdaptativo(true)}
                className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                style={{ border:'1px solid', borderColor: adaptativo===true ? '#4ade80' : 'rgba(74,222,128,0.2)', background: adaptativo===true ? 'rgba(74,222,128,0.15)' : 'rgba(74,222,128,0.04)', color: adaptativo===true ? '#4ade80' : 'rgba(74,222,128,0.5)' }}>
                ↑ Adaptativo
              </button>
              <button onClick={() => setAdaptativo(false)}
                className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                style={{ border:'1px solid', borderColor: adaptativo===false ? '#f87171' : 'rgba(248,113,113,0.2)', background: adaptativo===false ? 'rgba(248,113,113,0.15)' : 'rgba(248,113,113,0.04)', color: adaptativo===false ? '#f87171' : 'rgba(248,113,113,0.5)' }}>
                ↓ Desadaptativo
              </button>
            </div>
          </div>
        )}

        {/* Descrição */}
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-widest" style={{ color:'var(--text3)' }}>Contexto <span className="font-normal normal-case tracking-normal" style={{ color:'var(--text3)' }}>(opcional)</span></label>
          <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={2}
            placeholder="O que aconteceu? Como estava o ambiente? Com quem estava?"
            className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
            style={{ background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', color:'var(--text)' }}
            onFocus={e => e.target.style.borderColor = cat.color}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Botão salvar */}
        <button onClick={handleSave} disabled={saving || !canSave || saved}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
          style={{ background: saved ? '#22c55e' : cat.color, color:'#fff', boxShadow: `0 4px 20px ${cat.color}40` }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <><Check size={16} /> Salvo!</> : <><span>{cat.emoji}</span> Registrar {cat.label}</>}
        </button>
      </div>
    </div>
  );
}
