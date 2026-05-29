'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';

const CATS = [
  { key:'emocao',        label:'Emoção',         sub:'Como estou me sentindo',             icon:'💜' },
  { key:'pensamento',    label:'Pensamento',      sub:'O que passou pela minha cabeça',     icon:'🧠' },
  { key:'comportamento', label:'Comportamento',   sub:'Algo que fiz ou evitei fazer',       icon:'🔄' },
  { key:'evento',        label:'Evento',          sub:'Algo que aconteceu',                 icon:'📌' },
  { key:'atividade',     label:'Atividade',       sub:'Exercício, estudo, trabalho...',     icon:'⚡' },
  { key:'sono',          label:'Sono',            sub:'Como foi a noite',                   icon:'🌙' },
  { key:'memoria',       label:'Memória',         sub:'Uma lembrança que veio à mente',     icon:'🕰️' },
  { key:'sensacao',      label:'Sensação',        sub:'Algo que senti no corpo ou mente',   icon:'🌊' },
];

const OPCOES: Record<string, string[]> = {
  emocao:        ['Alegria','Gratidão','Amor','Motivação','Esperança','Serenidade','Satisfação','Orgulho','Alívio','Confiança','Entusiasmo','Leveza','Ansiedade','Tristeza','Raiva','Medo','Frustração','Culpa','Vergonha','Solidão','Exaustão','Insegurança','Estresse','Irritação','Curiosidade','Surpresa'],
  pensamento:    ['Ruminação','Catastrofização','Autocobrança','Ansiedade antecipatória','Autocrítica','Preocupação futura','Planejamento','Reflexão','Introspecção','Inspiração','Bloqueio mental','Pensamento intrusivo','Generalização excessiva','Filtro negativo'],
  comportamento: ['Procrastinação','Evitação','Isolamento','Compulsão','Verificação excessiva','Explosão emocional','Meditação','Exercício','Leitura','Estudo','Trabalho focado','Descanso','Autocuidado','Socializar','Grounding','Respiração profunda'],
  evento:        ['Positivo','Negativo','Neutro','Ambivalente'],
  atividade:     ['Física','Cognitiva','Criativa','Social','Terapêutica','Profissional','Recreativa','Espiritual','Doméstica'],
  sono:          ['Ótimo','Bom','Regular','Ruim','Péssimo'],
  memoria:       ['Episódica','Semântica','Emocional','Autobiográfica','Nostálgica','Traumática','Positiva','Neutra'],
  sensacao:      ['Tensão','Fadiga','Leveza','Formigamento','Pressão','Calor','Frio','Dor','Relaxamento','Vitalidade','Exaustão física','Clareza mental','Sobrecarga mental','Bloqueio','Presença'],
};

const SKIP_ADAPT = ['emocao','evento','atividade','sono','memoria','sensacao'];

const Q2_LABEL: Record<string,string> = {
  emocao:'Qual emoção?', pensamento:'Que tipo de pensamento?', comportamento:'Que comportamento foi?',
  evento:'Como foi o evento?', atividade:'Que tipo de atividade?', sono:'Como foi a qualidade?',
  memoria:'Que tipo de memória?', sensacao:'Que sensação?',
};

type Step = 'cat' | 'opcoes' | 'intensidade' | 'adaptativo' | 'contexto' | 'done';

const STEP_TITLES: Partial<Record<Step,string>> = {
  opcoes:'', intensidade:'Qual a intensidade?', adaptativo:'Como você avalia isso?', contexto:'Algum contexto?'
};

export default function RegistrarWizard() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>('cat');
  const [visible, setVisible] = useState(true);
  const [cat, setCat] = useState('');
  const [sels, setSels] = useState<string[]>([]);
  const [intensidade, setIntensidade] = useState<number|null>(null);
  const [adaptativo, setAdaptativo] = useState<boolean|null>(null);
  const [contexto, setContexto] = useState('');
  const [saving, setSaving] = useState(false);

  const stepNum: Record<Step,number> = { cat:1, opcoes:2, intensidade:3, adaptativo:4, contexto:5, done:6 };
  const totalSteps = 5;

  function transition(to: Step) {
    setVisible(false);
    setTimeout(() => { setStep(to); setVisible(true); }, 220);
  }

  function goBack() {
    if (step === 'opcoes') { transition('cat'); setSels([]); }
    else if (step === 'intensidade') { transition('opcoes'); setIntensidade(null); }
    else if (step === 'adaptativo') { transition('intensidade'); setAdaptativo(null); }
    else if (step === 'contexto') { transition(SKIP_ADAPT.includes(cat) ? 'intensidade' : 'adaptativo'); }
  }

  function afterCat(k: string) { setCat(k); setSels([]); transition('opcoes'); }
  function afterOpcoes() { transition('intensidade'); }
  function afterInt() { transition(SKIP_ADAPT.includes(cat) ? 'contexto' : 'adaptativo'); }
  function afterAdapt() { transition('contexto'); }

  async function salvar() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: reg } = await supabase.from('registros').insert({
      user_id: user.id, categoria: cat,
      titulo: sels.join(', '),
      intensidade, adaptativo,
      descricao: contexto || null,
      meta: { sels },
    }).select().single();
    if (reg && sels.length > 0) {
      await supabase.from('registro_itens').insert(
        sels.map(s => ({ registro_id: reg.id, user_id: user.id, nome: s, intensidade }))
      );
    }
    setSaving(false);
    transition('done');
  }

  const catObj = CATS.find(c => c.key === cat);
  const intColor = intensidade ? (intensidade <= 3 ? '#ef4444' : intensidade <= 6 ? '#f59e0b' : '#22c55e') : 'var(--text3)';
  const isMulti = !['evento','sono'].includes(cat);

  const wrap: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(10px)',
    transition: 'opacity 0.22s ease, transform 0.22s ease',
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', paddingTop: 32, paddingBottom: 48, minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>

      {/* Barra de progresso */}
      {step !== 'done' && (
        <div style={{ display: 'flex', gap: 5, marginBottom: 40 }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i < stepNum[step] - 1 ? 'var(--text)' : i === stepNum[step] - 1 ? 'var(--text2)' : 'var(--border2)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
      )}

      {/* Botão voltar */}
      {step !== 'cat' && step !== 'done' && (
        <button onClick={goBack} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text3)', display:'flex', alignItems:'center', gap:6, fontSize:14, marginBottom:32, padding:0 }}>
          <ArrowLeft size={16} /> Voltar
        </button>
      )}

      <div style={wrap}>

        {/* TELA 1 — Categoria */}
        {step === 'cat' && (
          <div style={{ display:'flex', flexDirection:'column', gap:32 }}>
            <div>
              <h1 style={{ fontSize:26, fontWeight:800, color:'var(--text)', marginBottom:6 }}>O que aconteceu?</h1>
              <p style={{ fontSize:14, color:'var(--text3)', margin:0 }}>Escolha uma categoria para começar</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {CATS.map(c => (
                <button key={c.key} onClick={() => afterCat(c.key)}
                  style={{ background:'rgba(255,255,255,0.03)', border:'1px solid var(--border2)', borderRadius:16, padding:'18px 16px', cursor:'pointer', textAlign:'left', display:'flex', flexDirection:'column', gap:8, transition:'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.18)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'; (e.currentTarget as HTMLElement).style.borderColor='var(--border2)'; }}>
                  <span style={{ fontSize:22 }}>{c.icon}</span>
                  <span style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{c.label}</span>
                  <span style={{ fontSize:12, color:'var(--text3)', lineHeight:1.4 }}>{c.sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TELA 2 — Opções */}
        {step === 'opcoes' && catObj && (
          <div style={{ display:'flex', flexDirection:'column', gap:32 }}>
            <div>
              <h1 style={{ fontSize:26, fontWeight:800, color:'var(--text)', marginBottom:6 }}>{Q2_LABEL[cat]}</h1>
              <p style={{ fontSize:14, color:'var(--text3)', margin:0 }}>{isMulti ? 'Pode selecionar mais de uma' : 'Selecione uma opção'}</p>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {(OPCOES[cat] || []).map(op => {
                const isSel = sels.includes(op);
                return (
                  <button key={op} onClick={() => {
                    if (!isMulti) setSels([op]);
                    else setSels(prev => prev.includes(op) ? prev.filter(x=>x!==op) : [...prev, op]);
                  }}
                    style={{ padding:'9px 18px', borderRadius:99, fontSize:13, fontWeight:isSel?700:500, cursor:'pointer', transition:'all 0.15s',
                      border: isSel ? '1.5px solid var(--text)' : '1px solid var(--border2)',
                      background: isSel ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)',
                      color: isSel ? 'var(--text)' : 'var(--text2)' }}>
                    {op}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop:'auto' }}>
              <button onClick={afterOpcoes} disabled={sels.length === 0}
                style={{ width:'100%', padding:'14px', borderRadius:14, fontSize:14, fontWeight:700, border:'none',
                  cursor: sels.length > 0 ? 'pointer' : 'not-allowed',
                  background: sels.length > 0 ? 'var(--text)' : 'var(--border2)',
                  color: sels.length > 0 ? 'var(--bg)' : 'var(--text3)', transition:'all 0.2s' }}>
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* TELA 3 — Intensidade */}
        {step === 'intensidade' && (
          <div style={{ display:'flex', flexDirection:'column', gap:32 }}>
            <div>
              <h1 style={{ fontSize:26, fontWeight:800, color:'var(--text)', marginBottom:6 }}>Qual a intensidade?</h1>
              <p style={{ fontSize:14, color:'var(--text3)', margin:0 }}>O quanto isso está presente em você agora</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => {
                const isSel = intensidade === n;
                const c = n<=3?'#ef4444':n<=6?'#f59e0b':'#22c55e';
                return (
                  <button key={n} onClick={() => setIntensidade(n)}
                    style={{ padding:'16px 8px', borderRadius:12, fontSize:16, fontWeight:700, cursor:'pointer', transition:'all 0.15s', textAlign:'center',
                      border: isSel ? `2px solid ${c}` : '1px solid var(--border2)',
                      background: isSel ? `${c}20` : 'rgba(255,255,255,0.02)',
                      color: isSel ? c : 'var(--text3)' }}>
                    {n}
                  </button>
                );
              })}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text3)', marginTop:-20 }}>
              <span>Leve</span><span>Moderado</span><span>Intenso</span>
            </div>
            <div style={{ marginTop:'auto' }}>
              <button onClick={afterInt} disabled={!intensidade}
                style={{ width:'100%', padding:'14px', borderRadius:14, fontSize:14, fontWeight:700, border:'none',
                  cursor: intensidade ? 'pointer' : 'not-allowed',
                  background: intensidade ? 'var(--text)' : 'var(--border2)',
                  color: intensidade ? 'var(--bg)' : 'var(--text3)', transition:'all 0.2s' }}>
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* TELA 4 — Adaptativo */}
        {step === 'adaptativo' && (
          <div style={{ display:'flex', flexDirection:'column', gap:32 }}>
            <div>
              <h1 style={{ fontSize:26, fontWeight:800, color:'var(--text)', marginBottom:6 }}>Como você avalia isso?</h1>
              <p style={{ fontSize:14, color:'var(--text3)', margin:0 }}>Sem julgamento — é para mapear padrões</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { val:true,  label:'Adaptativo',    sub:'Me ajuda a avançar',    icon:'↑', color:'#22c55e' },
                { val:false, label:'Desadaptativo',  sub:'Me trava ou prejudica', icon:'↓', color:'#ef4444' },
              ].map(opt => {
                const isSel = adaptativo === opt.val;
                return (
                  <button key={String(opt.val)} onClick={() => setAdaptativo(opt.val)}
                    style={{ background: isSel ? `${opt.color}15` : 'rgba(255,255,255,0.03)',
                      border: isSel ? `2px solid ${opt.color}` : '1px solid var(--border2)',
                      borderRadius:16, padding:'20px 16px', cursor:'pointer', textAlign:'left',
                      display:'flex', flexDirection:'column', gap:8, transition:'all 0.15s' }}>
                    <span style={{ fontSize:22, color:opt.color }}>{opt.icon}</span>
                    <span style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{opt.label}</span>
                    <span style={{ fontSize:12, color:'var(--text3)' }}>{opt.sub}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop:'auto', display:'flex', gap:10 }}>
              <button onClick={afterAdapt} style={{ padding:'13px 20px', borderRadius:14, fontSize:14, background:'none', border:'1px solid var(--border2)', color:'var(--text3)', cursor:'pointer' }}>Pular</button>
              <button onClick={afterAdapt} disabled={adaptativo === null}
                style={{ flex:1, padding:'14px', borderRadius:14, fontSize:14, fontWeight:700, border:'none',
                  cursor: adaptativo !== null ? 'pointer' : 'not-allowed',
                  background: adaptativo !== null ? 'var(--text)' : 'var(--border2)',
                  color: adaptativo !== null ? 'var(--bg)' : 'var(--text3)', transition:'all 0.2s' }}>
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* TELA 5 — Contexto */}
        {step === 'contexto' && (
          <div style={{ display:'flex', flexDirection:'column', gap:32 }}>
            <div>
              <h1 style={{ fontSize:26, fontWeight:800, color:'var(--text)', marginBottom:6 }}>Algum contexto?</h1>
              <p style={{ fontSize:14, color:'var(--text3)', margin:0 }}>Onde estava, com quem, o que desencadeou</p>
            </div>
            <textarea value={contexto} onChange={e => setContexto(e.target.value)} rows={5}
              placeholder="Ex: Estava em casa antes de uma reunião importante..."
              style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid var(--border2)', borderRadius:14, padding:'14px 16px', fontSize:14, color:'var(--text)', resize:'none', outline:'none', lineHeight:1.6, fontFamily:'var(--font)' }}
              onFocus={e => e.target.style.borderColor='rgba(255,255,255,0.2)'}
              onBlur={e => e.target.style.borderColor='var(--border2)'}
            />
            <div style={{ marginTop:'auto', display:'flex', gap:10 }}>
              <button onClick={salvar} style={{ padding:'13px 20px', borderRadius:14, fontSize:14, background:'none', border:'1px solid var(--border2)', color:'var(--text3)', cursor:'pointer' }}>Pular</button>
              <button onClick={salvar} disabled={saving}
                style={{ flex:1, padding:'14px', borderRadius:14, fontSize:14, fontWeight:700, border:'none', cursor:'pointer', background:'var(--text)', color:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {saving ? <><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }} /> Salvando...</> : 'Salvar registro'}
              </button>
            </div>
          </div>
        )}

        {/* TELA FINAL */}
        {step === 'done' && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, textAlign:'center', paddingTop:40 }}>
            <div style={{ width:60, height:60, borderRadius:'50%', background:'rgba(255,255,255,0.06)', border:'1px solid var(--border2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>
              {catObj?.icon}
            </div>
            <div>
              <h1 style={{ fontSize:24, fontWeight:800, color:'var(--text)', margin:'0 0 8px' }}>Registrado ✓</h1>
              <p style={{ fontSize:14, color:'var(--text3)', margin:0 }}>{catObj?.label} salva com sucesso</p>
            </div>
            {sels.length > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center', maxWidth:320 }}>
                {sels.map(s => (
                  <span key={s} style={{ padding:'5px 12px', borderRadius:99, fontSize:12, background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)', color:'var(--text3)' }}>{s}</span>
                ))}
                {intensidade && <span style={{ padding:'5px 12px', borderRadius:99, fontSize:12, background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)', color:'var(--text3)' }}>{intensidade}/10</span>}
              </div>
            )}
            <div style={{ display:'flex', gap:10, marginTop:8 }}>
              <button onClick={() => { transition('cat'); setCat(''); setSels([]); setIntensidade(null); setAdaptativo(null); setContexto(''); }}
                style={{ padding:'12px 20px', borderRadius:12, fontSize:13, background:'none', border:'1px solid var(--border2)', color:'var(--text3)', cursor:'pointer' }}>
                Novo registro
              </button>
              <button onClick={() => router.push('/dashboard')}
                style={{ padding:'12px 20px', borderRadius:12, fontSize:13, fontWeight:700, border:'none', background:'var(--text)', color:'var(--bg)', cursor:'pointer' }}>
                Ver dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
