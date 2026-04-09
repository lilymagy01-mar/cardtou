import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabase 미설정 시에도 앱이 정상 구동되도록 Proxy 패턴 적용
let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  // Next.js client-side variable check (Prefix with NEXT_PUBLIC_)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    if (typeof window !== 'undefined') {
      console.warn('[CardToYou] Supabase 환경변수가 설정되지 않았습니다. 클라우드 저장 기능이 비활성화됩니다.');
    }
    // 더미 클라이언트를 반환하여 런타임 크래시 방지
    return {
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        update: () => ({ eq: () => Promise.resolve({ error: { message: 'Supabase not configured' } }) }),
      }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }
  _supabase = createClient(url, key);
  return _supabase;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get: (_target, prop) => {
    const client = getSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (client as any)[prop];
  },
});
