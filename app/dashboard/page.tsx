import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardHome from './DashboardHome';

function calcStreak(registros: { created_at: string }[]): number {
  if (!registros.length) return 0;
  const dias = new Set(registros.map(r => new Date(r.created_at).toLocaleDateString('pt-BR')));
  let streak = 0;
  const hoje = new Date();
  for (let i = 0; i <= 365; i++) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() - i);
    if (dias.has(d.toLocaleDateString('pt-BR'))) streak++;
    else if (i > 0) break;
  }
  return streak;
}

function gerarInsight(registros: { categoria: string; titulo: string; intensidade: number; created_at: string }[]): string | null {
  if (registros.length < 3) return null;
  const ultimos7 = registros.filter(r => new Date(r.created_at) > new Date(Date.now() - 7 * 86400000));
  if (!ultimos7.length) return null;

  const freq: Record<string, number> = {};
  ultimos7.forEach(r => {
    r.titulo?.split(', ').forEach((t: string) => { freq[t] = (freq[t] || 0) + 1; });
  });
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
  if (top && top[1] >= 2) return `Você registrou "${top[0]}" ${top[1]}x essa semana.`;

  const medInt = ultimos7.filter(r => r.intensidade > 0).reduce((a, r) => a + r.intensidade, 0) / (ultimos7.filter(r => r.intensidade > 0).length || 1);
  if (medInt >= 7) return `Intensidade média alta essa semana: ${medInt.toFixed(1)}/10. Atenção ao seu ritmo.`;
  if (medInt <= 3) return `Intensidade leve essa semana: ${medInt.toFixed(1)}/10. Momento de equilíbrio.`;
  return `${ultimos7.length} registro${ultimos7.length > 1 ? 's' : ''} essa semana. Continue o hábito.`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const [{ data: registros }, { data: projetos }] = await Promise.all([
    supabase.from('registros').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30),
    supabase.from('projetos').select('*').eq('user_id', user.id).eq('status', 'ativo'),
  ]);

  const regs = registros || [];
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  const nome = user.email?.split('@')[0] || 'você';
  const streak = calcStreak(regs);
  const insight = gerarInsight(regs);

  return (
    <DashboardHome
      nome={nome}
      saudacao={saudacao}
      streak={streak}
      insight={insight}
      registros={regs.slice(0, 8)}
      totalRegistros={regs.length}
      projetosCount={(projetos || []).length}
    />
  );
}
