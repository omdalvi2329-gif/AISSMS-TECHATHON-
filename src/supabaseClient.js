import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase Environment Variables. Check your .env file.');
}

const globalKey = '__agriSetuSupabaseClient';

const createSupabaseSingleton = () =>
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  });

export const supabase = (() => {
  try {
    if (typeof window !== 'undefined') {
      if (!window[globalKey]) {
        window[globalKey] = createSupabaseSingleton();
      }
      return window[globalKey];
    }
  } catch (e) {
    // ignore
  }
  return createSupabaseSingleton();
})();
