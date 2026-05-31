import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

/** Vrai si les variables d'environnement Supabase sont présentes. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Client Supabase unique, partagé dans toute l'application.
// Si la config manque, on crée tout de même un client avec des valeurs
// neutres pour éviter un crash à l'import ; App affiche alors un écran d'aide
// (voir isSupabaseConfigured).
export const supabase = createClient(
  supabaseUrl ?? 'http://localhost',
  supabaseAnonKey ?? 'public-anon-key',
);
