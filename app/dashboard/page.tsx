import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardHome from './DashboardHome';
export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');
  const { data: registros } = await supabase.from('registros').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(8);
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  const nome = user.email?.split('@')[0] || 'você';
  return <DashboardHome nome={nome} saudacao={saudacao} registros={registros || []} />;
}
