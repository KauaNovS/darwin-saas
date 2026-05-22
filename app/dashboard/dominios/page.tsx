import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CatalogoDominiosClient from './CatalogoDominiosClient';
export default async function DominiosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');
  return <CatalogoDominiosClient />;
}
