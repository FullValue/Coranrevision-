import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { DailyLog, Profile } from '../lib/types';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import MonthCalendar from '../components/MonthCalendar';
import LogsHistory from '../components/LogsHistory';
import ProgressSummary from '../components/ProgressSummary';
import SurahGrid from '../components/SurahGrid';

export default function AdminEleveDetail() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      const [prof, logsRes, stateRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase
          .from('daily_logs')
          .select('*')
          .eq('eleve_id', id)
          .order('log_date', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase.from('learning_state').select('surah_id').eq('eleve_id', id),
      ]);

      if (!active) return;

      if (prof.error || !prof.data) {
        setError("Élève introuvable ou accès refusé.");
        setLoading(false);
        return;
      }

      setProfile(prof.data as Profile);
      setLogs((logsRes.data ?? []) as DailyLog[]);
      setKnown(
        new Set((stateRes.data ?? []).map((r) => r.surah_id as number)),
      );
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const loggedDates = useMemo(
    () => new Set(logs.map((l) => l.log_date)),
    [logs],
  );

  if (loading) return <Spinner label="Chargement de l'élève…" />;

  if (error || !profile) {
    return (
      <div className="space-y-4">
        <BackLink />
        <p className="rounded-lg bg-manque-doux px-3 py-2 text-sm text-manque">
          {error ?? 'Élève introuvable.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackLink />

      <div>
        <h1 className="text-xl font-medium text-neutral-900">
          {profile.full_name || 'Élève sans nom'}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Vue en lecture seule — suivi de l'élève.
        </p>
      </div>

      <Card>
        <h2 className="mb-4 text-sm font-medium text-neutral-800">Assiduité</h2>
        <MonthCalendar loggedDates={loggedDates} />
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-medium text-neutral-800">
          Progression
        </h2>
        <ProgressSummary known={known} />
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-medium text-neutral-800">
          Historique des révisions
        </h2>
        <LogsHistory logs={logs} />
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-medium text-neutral-800">
          Sourates connues
        </h2>
        <SurahGrid known={known} readOnly />
      </Card>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/admin"
      className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800"
    >
      ‹ Retour aux élèves
    </Link>
  );
}
