import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client for API routes.
 * Prefers SUPABASE_SERVICE_ROLE_KEY (bypasses RLS) so inserts to Leads succeed.
 * Falls back to anon key if service role is not set.
 */
export function getSupabaseServer() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const rawAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const url = typeof rawUrl === 'string' ? rawUrl.trim().replace(/^["']|["']$/g, '') : '';
  const key = typeof rawServiceKey === 'string' && rawServiceKey.trim()
    ? rawServiceKey.trim().replace(/^["']|["']$/g, '')
    : typeof rawAnonKey === 'string' ? rawAnonKey.trim().replace(/^["']|["']$/g, '') : '';
  if (!url || !key) return null;
  if (!url.startsWith('http://') && !url.startsWith('https://')) return null;
  try {
    return createClient(url, key);
  } catch {
    return null;
  }
}
