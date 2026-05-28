import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import RegistrarWizard from './RegistrarWizard';
export default async function RegistrarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');
  return <RegistrarWizard />;
}
