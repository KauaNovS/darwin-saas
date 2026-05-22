import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Plus, Zap, FolderOpen, BarChart2, TrendingUp } from 'lucide-react';

const TIPO_EVENTO_LABELS: Record<string, string> = {
  emocional: '💜', social: '👥', cognitivo: '🧠',
  operacional: '⚙️', biologico: '💪', financeiro: '💰'
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const [{ data: eventos }, { data: projetos }, { data: insights }] = await Promise.all([
    supabase.from('eventos').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('projetos').select('*').eq('user_id', user.id).eq('status', 'ativo'),
    supabase.from('insights').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
  ]);

  const ultimosEventos = eventos || [];
  const projetosAtivos = projetos || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Olá, {user.email?.split('@')[0]} 👋</h1>
        <p className="text-white/50 text-sm mt-1">Comece registrando seu primeiro evento.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Eventos', value: ultimosEventos.length, icon: Zap, color: 'text-purple-400' },
          { label: 'Projetos ativos', value: projetosAtivos.length, icon: FolderOpen, color: 'text-blue-400' },
          { label: 'Padrões detectados', value: 0, icon: BarChart2, color: 'text-green-400' },
          { label: 'Esta semana', value: ultimosEventos.filter(e => new Date(e.created_at) > new Date(Date.now() - 7*24*60*60*1000)).length, icon: TrendingUp, color: 'text-yellow-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={16} className={color} />
              <span className="text-white/50 text-xs">{label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/80">Últimos eventos</h2>
            <Link href="/dashboard/eventos" className="text-xs text-white/40 hover:text-white flex items-center gap-1 transition-colors">Ver todos <ArrowRight size={12} /></Link>
          </div>
          {ultimosEventos.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-white/30 text-sm">Nenhum evento ainda.</p>
              <Link href="/dashboard/eventos" className="text-purple-400 text-xs mt-2 inline-flex items-center gap-1"><Plus size={12} />Registrar evento</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {ultimosEventos.map(ev => (
                <div key={ev.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white/80 font-medium truncate">{ev.titulo}</p>
                    <span className="text-xs text-white/40">{TIPO_EVENTO_LABELS[ev.tipo] ?? '📌'} {ev.tipo}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white/80 mb-4">Questionamentos reflexivos</h2>
          <p className="text-white/30 text-sm text-center py-6">Registre mais eventos para gerar questionamentos.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/80">Padrões detectados</h2>
            <Link href="/dashboard/padroes" className="text-xs text-white/40 hover:text-white flex items-center gap-1">Ver todos <ArrowRight size={12} /></Link>
          </div>
          <p className="text-white/30 text-sm text-center py-6">Registre pelo menos 3 eventos para detectar padrões.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/80">Projetos ativos</h2>
            <Link href="/dashboard/projetos" className="text-xs text-white/40 hover:text-white flex items-center gap-1">Ver todos <ArrowRight size={12} /></Link>
          </div>
          {projetosAtivos.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-white/30 text-sm">Nenhum projeto ativo.</p>
              <Link href="/dashboard/projetos" className="text-purple-400 text-xs mt-2 inline-flex items-center gap-1"><Plus size={12} />Novo projeto</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {projetosAtivos.slice(0,3).map(proj => (
                <div key={proj.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: proj.cor || '#6e56ff' }} />
                  <p className="text-sm text-white/80 font-medium truncate flex-1">{proj.nome}</p>
                  <span className="text-xs text-white/40">{proj.progresso ?? 0}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
