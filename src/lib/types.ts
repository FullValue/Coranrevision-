// Types partagés correspondant au schéma de la base.

export type UserRole = 'prof' | 'eleve';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface DailyLog {
  id: string;
  eleve_id: string;
  log_date: string; // 'YYYY-MM-DD'
  surah_from: number;
  surah_to: number;
  note: string | null;
  created_at: string;
}

export interface LearningStateRow {
  eleve_id: string;
  surah_id: number;
  created_at: string;
}
