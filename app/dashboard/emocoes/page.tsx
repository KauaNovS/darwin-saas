import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CatalogoEmocoesClient from './CatalogoEmocoesClient';
export default async function EmocoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');
  return <CatalogoEmocoesClient />;
}
