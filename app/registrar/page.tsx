'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Loader2, SkipForward } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  TIPOS_REGISTRO, EMOCOES, PENSAMENTOS, SENSACOES,
  COMPORTAMENTOS, EVENTOS, ATIVIDADES, MEMORIAS
} from '@/lib/dados-registro';

// ─── COMPONENTES BASE ───
function Tela({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background:'var(--bg)' }}>
      {children}
    </div>
  );
}

function Header({ onBack, step, total }: { onBack?: () => void; step: number; total: number }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="px-6 pt-6 pb-4 flex-shrink-0">
      <div className="flex items-center gap-4 mb-5">
        {onBack && (
          <button onClick={onBack} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{ background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)' }}>
            <ArrowLeft size={18} style={{ color:'var(--text2)' }} />
          </button>
        )}
        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.07)' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width:pct+'%', background:'var(--accent)' }} />
        </div>
        <span className="text-xs font-mono flex-shrink-0" style={{ color:'var(--text3)' }}>{step}/{total}</span>
      </div>
    </div>
  );
}

function Pergunta({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-2xl font-black leading-tight mb-8" style={{ color:'var(--text)' }}>
      {children}
    </h1>
  );
}

function BotaoGrande({ emoji, label, desc, color, bg, onClick, selected }:
  { emoji:string; label:string; desc?:string; color:string; bg:string; onClick:()=>void; selected?:boolean }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-95"
      style={{
        background: selected ? bg : 'rgba(255,255,255,0.03)',
        border: `1px solid ${selected ? color+'60' : 'var(--border)'}`,
        transform: selected ? 'scale(1.01)' : '',
      }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: selected ? bg : 'rgba(255,255,255,0.05)' }}>
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold" style={{ color: selected ? color : 'var(--text)' }}>{label}</div>
        {desc && <div className="text-sm mt-0.5" style={{ color:'var(--text3)' }}>{desc}</div>}
      </div>
      {selected && <Check size={18} style={{ color, flexShrink:0 }} />}
    </button>
  );
}

function ChipGrid({ grupos, onSelect, selecionados, multiSelect }:
  { grupos: Record<string,{color:string;label:string;items:string[]}>; onSelect:(item:string)=>void; selecionados:string[]; multiSelect?:boolean }) {
  return (
    <div className="space-y-5">
      {Object.entries(grupos).map(([, grp]) => (
        <div key={grp.label}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:grp.color+'99' }}>
            {grp.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {grp.items.map(item => {
              const sel = selecionados.includes(item);
              return (
                <button key={item} onClick={() => onSelect(item)}
                  className="px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all active:scale-95"
                  style={{
                    background: sel ? grp.color+'22' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${sel ? grp.color+'55' : 'var(--border)'}`,
                    color: sel ? grp.color : 'var(--text2)',
                    fontWeight: sel ? '700' : '600',
                  }}>
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function BotoesInt({ valor, onSelect, color }: { valor:number|null; onSelect:(v:number)=>void; color:string }) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {[1,2,3,4,5,6,7,8,9,10].map(n => {
        const sel = valor === n;
        const intColor = n <= 3 ? '#ef4444' : n <= 6 ? '#f59e0b' : '#22c55e';
        return (
          <button key={n} onClick={() => onSelect(n)}
            className="h-16 rounded-2xl text-xl font-black transition-all active:scale-90"
            style={{
              background: sel ? intColor+'25' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${sel ? intColor+'66' : 'var(--border)'}`,
              color: sel ? intColor : 'var(--text3)',
            }}>
            {n}
          </button>
        );
      })}
    </div>
  );
}

function BotaoPrincipal({ onClick, disabled, children, color }:
  { onClick:()=>void; disabled?:boolean; children:React.ReactNode; color?:string }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full py-4 rounded-2xl text-base font-bold transition-all disabled:opacity-30 active:scale-98"
      style={{ background: color || 'var(--accent)', color:'#fff', boxShadow:`0 4px 20px ${(color||'#7b61ff')}40` }}>
      {children}
    </button>
  );
}

// ─── FLUXO PRINCIPAL ───
type Estado = {
  tipo: string | null;
  itens: string[];       // emoções, pensamentos, etc selecionados
  intensidade: number | null;
  adaptativo: boolean | null;
  contexto: string;
  subTipo: string | null; // tipo de memória, etc
};

const TOTAL_STEPS_BASE = 5; // tipo → itens → intensidade → contexto → salvo

export default function RegistrarPage() {
  const router = useRouter();
  const supabase = createClient();
  const [tela, setTela] = useState(0); // 0=tipo, 1=itens, 2=intensidade, 3=adaptativo(opcional), 4=contexto, 5=salvo
  const [estado, setEstado] = useState<Estado>({
    tipo: null, itens: [], intensidade: null, adaptativo: null, contexto: '', subTipo: null
  });
  const [saving, setSaving] = useState(false);

  const tipoMeta = TIPOS_REGISTRO.find(t => t.key === estado.tipo);
  const temAdaptativo = estado.tipo === 'comportamento' || estado.tipo === 'pensamento';

  // Calcula total de telas
  function totalTelas() {
    if (!estado.tipo) return 5;
    let t = 4; // tipo + itens + intensidade + contexto
    if (temAdaptativo) t++;
    return t;
  }

  function stepAtual() {
    // Mapeia tela → step visual
    if (tela === 0) return 1;
    if (tela === 1) return 2;
    if (tela === 2) return 3;
    if (tela === 3 && temAdaptativo) return 4;
    if (tela === 3 && !temAdaptativo) return 4; // contexto
    if (tela === 4) return temAdaptativo ? 5 : 4;
    return totalTelas();
  }

  function voltar() {
    if (tela === 0) { router.push('/dashboard'); return; }
    if (tela === 3 && !temAdaptativo) { setTela(2); return; }
    setTela(t => t - 1);
  }

  function avancar() {
    if (tela === 1 && !temAdaptativo) { setTela(3); return; } // pula adaptativo
    setTela(t => t + 1);
  }

  function toggleItem(item: string) {
    setEstado(prev => ({
      ...prev,
      itens: prev.itens.includes(item)
        ? prev.itens.filter(i => i !== item)
        : [...prev.itens, item]
    }));
  }

  async function salvar() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: reg } = await supabase.from('registros').insert({
      user_id: user.id,
      categoria: estado.tipo,
      titulo: estado.itens.slice(0,3).join(', ') || tipoMeta?.label || '',
      descricao: estado.contexto || null,
      intensidade: estado.intensidade,
      adaptativo: estado.adaptativo,
      meta: {
        itens: estado.itens,
        subTipo: estado.subTipo,
      },
    }).select().single();

    if (reg && estado.itens.length > 0) {
      await supabase.from('registro_itens').insert(
        estado.itens.map(nome => ({ registro_id: reg.id, user_id: user.id, nome, intensidade: estado.intensidade }))
      );
    }

    setSaving(false);
    setTela(99); // sucesso
  }

  // ── TELA 0: Tipo de registro ──
  if (tela === 0) return (
    <Tela>
      <Header onBack={() => router.push('/dashboard')} step={1} total={totalTelas()} />
      <div className="flex-1 px-6 overflow-y-auto">
        <Pergunta>O que quer<br/>registrar?</Pergunta>
        <div className="space-y-2.5 pb-8">
          {TIPOS_REGISTRO.map(t => (
            <BotaoGrande key={t.key} emoji={t.emoji} label={t.label} desc={t.desc}
              color={t.color} bg={t.bg}
              selected={estado.tipo === t.key}
              onClick={() => { setEstado(p => ({...p, tipo:t.key, itens:[], intensidade:null, adaptativo:null})); setTela(1); }} />
          ))}
        </div>
      </div>
    </Tela>
  );

  // ── TELA 1: Itens específicos ──
  if (tela === 1) {
    const grupos =
      estado.tipo === 'emocao'        ? EMOCOES :
      estado.tipo === 'pensamento'    ? PENSAMENTOS :
      estado.tipo === 'sensacao'      ? SENSACOES :
      estado.tipo === 'comportamento' ? COMPORTAMENTOS :
      estado.tipo === 'evento'        ? EVENTOS :
      estado.tipo === 'atividade'     ? ATIVIDADES :
      estado.tipo === 'memoria'       ? MEMORIAS : null;

    const isMem = estado.tipo === 'memoria';

    return (
      <Tela>
        <Header onBack={voltar} step={2} total={totalTelas()} />
        <div className="flex-1 px-6 overflow-y-auto">
          <Pergunta>
            {estado.tipo === 'emocao'        ? 'Que emoção
você sente?' :
             estado.tipo === 'pensamento'    ? 'Que tipo de
pensamento?' :
             estado.tipo === 'sensacao'      ? 'O que sente
no corpo?' :
             estado.tipo === 'comportamento' ? 'Como está
agindo?' :
             estado.tipo === 'evento'        ? 'Que tipo de
evento?' :
             estado.tipo === 'atividade'     ? 'Que atividade
fez?' :
             estado.tipo === 'sono'          ? 'Como foi
o sono?' :
             'Que tipo de
memória?'}
          </Pergunta>

          {estado.tipo === 'sono' ? (
            <div className="space-y-4">
              {['Ótimo — acordei descansado','Bom — razoavelmente descansado','Regular — poderia ser melhor','Ruim — acordei cansado','Péssimo — mal dormi'].map((op,i) => {
                const cores = ['#4ade80','#86efac','#fbbf24','#fb923c','#f87171'];
                const sel = estado.itens[0] === op;
                return (
                  <button key={op} onClick={() => { setEstado(p=>({...p,itens:[op]})); setTela(2); }}
                    className="w-full p-4 rounded-2xl text-left font-semibold transition-all active:scale-95"
                    style={{ background: sel ? cores[i]+'20' : 'rgba(255,255,255,0.04)', border:`1px solid ${sel ? cores[i]+'55' : 'var(--border)'}`, color: sel ? cores[i] : 'var(--text2)' }}>
                    {op}
                  </button>
                );
              })}
            </div>
          ) : isMem ? (
            <div className="space-y-2.5 pb-8">
              {grupos && Object.entries(grupos).map(([key, grp]: [string, {color:string;label:string;desc?:string;items?:string[]}]) => {
                const sel = estado.subTipo === key;
                return (
                  <button key={key} onClick={() => { setEstado(p=>({...p,subTipo:key,itens:[grp.label]})); setTela(2); }}
                    className="w-full flex items-start gap-4 p-4 rounded-2xl text-left transition-all active:scale-95"
                    style={{ background: sel ? grp.color+'18' : 'rgba(255,255,255,0.03)', border:`1px solid ${sel ? grp.color+'50' : 'var(--border)'}` }}>
                    <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ background:grp.color }} />
                    <div>
                      <div className="font-bold" style={{ color: sel ? grp.color : 'var(--text)' }}>{grp.label}</div>
                      {grp.desc && <div className="text-sm mt-0.5" style={{ color:'var(--text3)' }}>{grp.desc}</div>}
                    </div>
                    {sel && <Check size={16} style={{ color:grp.color, flexShrink:0, marginLeft:'auto' }} />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="pb-8">
              {grupos && <ChipGrid grupos={grupos as Record<string,{color:string;label:string;items:string[]}>}
                onSelect={toggleItem} selecionados={estado.itens} multiSelect />}
            </div>
          )}
        </div>

        {!['sono','memoria'].includes(estado.tipo || '') && (
          <div className="px-6 pb-8 pt-4 space-y-3 flex-shrink-0">
            <BotaoPrincipal onClick={avancar} disabled={estado.itens.length === 0} color={tipoMeta?.color}>
              Continuar {estado.itens.length > 0 && `(${estado.itens.length} ${estado.itens.length===1?'item':'itens'})`}
            </BotaoPrincipal>
          </div>
        )}
      </Tela>
    );
  }

  // ── TELA 2: Intensidade ──
  if (tela === 2) return (
    <Tela>
      <Header onBack={voltar} step={3} total={totalTelas()} />
      <div className="flex-1 px-6">
        <Pergunta>Qual a<br/>intensidade?</Pergunta>
        <p className="text-sm mb-8 -mt-4" style={{ color:'var(--text3)' }}>
          {estado.tipo === 'sono' ? 'Como você avalia a qualidade geral?' : 'De 1 (muito leve) a 10 (muito intenso)'}
        </p>
        <BotoesInt valor={estado.intensidade} color={tipoMeta?.color || 'var(--accent)'}
          onSelect={v => { setEstado(p=>({...p,intensidade:v})); avancar(); }} />
      </div>
    </Tela>
  );

  // ── TELA 3: Adaptativo (só comportamento/pensamento) ──
  if (tela === 3 && temAdaptativo) return (
    <Tela>
      <Header onBack={voltar} step={4} total={totalTelas()} />
      <div className="flex-1 px-6">
        <Pergunta>Como você<br/>classifica isso?</Pergunta>
        <p className="text-sm mb-8 -mt-4" style={{ color:'var(--text3)' }}>
          Adaptativo te aproxima dos seus objetivos. Desadaptativo te afasta.
        </p>
        <div className="space-y-3">
          <button onClick={() => { setEstado(p=>({...p,adaptativo:true})); setTela(4); }}
            className="w-full p-5 rounded-2xl text-left transition-all active:scale-95"
            style={{ background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.3)' }}>
            <div className="text-lg font-black" style={{ color:'#4ade80' }}>↑ Adaptativo</div>
            <div className="text-sm mt-1" style={{ color:'var(--text3)' }}>Me aproxima de onde quero chegar</div>
          </button>
          <button onClick={() => { setEstado(p=>({...p,adaptativo:false})); setTela(4); }}
            className="w-full p-5 rounded-2xl text-left transition-all active:scale-95"
            style={{ background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.3)' }}>
            <div className="text-lg font-black" style={{ color:'#f87171' }}>↓ Desadaptativo</div>
            <div className="text-sm mt-1" style={{ color:'var(--text3)' }}>Me afasta ou me prejudica</div>
          </button>
          <button onClick={() => { setEstado(p=>({...p,adaptativo:null})); setTela(4); }}
            className="w-full p-3 rounded-2xl text-center transition-all"
            style={{ color:'var(--text3)' }}>
            Não sei / Neutro
          </button>
        </div>
      </div>
    </Tela>
  );

  // ── TELA 4 (ou 3 sem adaptativo): Contexto ──
  if (tela === 3 || tela === 4) return (
    <Tela>
      <Header onBack={voltar} step={temAdaptativo ? 5 : 4} total={totalTelas()} />
      <div className="flex-1 px-6 flex flex-col">
        <Pergunta>Quer adicionar<br/>contexto?</Pergunta>
        <p className="text-sm mb-6 -mt-4" style={{ color:'var(--text3)' }}>
          Opcional — escreva o que quiser sobre o momento
        </p>
        <textarea value={estado.contexto}
          onChange={e => setEstado(p=>({...p,contexto:e.target.value}))}
          placeholder="O que aconteceu? Onde estava? Com quem? O que pensou?..."
          className="flex-1 rounded-2xl p-5 text-sm resize-none outline-none transition-all"
          style={{ background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', color:'var(--text)', minHeight:'160px' }}
          onFocus={e => e.target.style.borderColor = tipoMeta?.color || 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>
      <div className="px-6 pb-8 pt-5 space-y-3 flex-shrink-0">
        <BotaoPrincipal onClick={salvar} color={tipoMeta?.color}>
          {saving ? <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin"/>Salvando...</span> : 'Salvar registro'}
        </BotaoPrincipal>
        <button onClick={salvar} disabled={saving}
          className="w-full py-3 text-sm font-semibold flex items-center justify-center gap-2"
          style={{ color:'var(--text3)' }}>
          <SkipForward size={14} /> Pular e salvar
        </button>
      </div>
    </Tela>
  );

  // ── TELA 99: Sucesso ──
  return (
    <Tela>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: tipoMeta?.bg || 'rgba(123,97,255,0.15)', border:`1px solid ${tipoMeta?.color || 'var(--accent)'}40` }}>
          <span className="text-4xl">{tipoMeta?.emoji}</span>
        </div>
        <h1 className="text-2xl font-black mb-2" style={{ color:'var(--text)' }}>Registrado!</h1>
        <p className="text-sm mb-1" style={{ color:'var(--text2)' }}>
          {estado.itens.slice(0,3).join(', ')}
        </p>
        {estado.intensidade && (
          <p className="text-xs mb-8" style={{ color:'var(--text3)' }}>Intensidade {estado.intensidade}/10</p>
        )}
        <div className="w-full space-y-3">
          <BotaoPrincipal onClick={() => { setEstado({tipo:null,itens:[],intensidade:null,adaptativo:null,contexto:'',subTipo:null}); setTela(0); }} color={tipoMeta?.color}>
            Novo registro
          </BotaoPrincipal>
          <button onClick={() => router.push('/dashboard')}
            className="w-full py-3 text-sm font-semibold"
            style={{ color:'var(--text3)' }}>
            Voltar ao início
          </button>
        </div>
      </div>
    </Tela>
  );
}
