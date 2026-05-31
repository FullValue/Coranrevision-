import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/types';
import { computeProgress } from '../lib/progress';
import { monthAttendance } from '../lib/attendance';
import { formatLongDate } from '../lib/dates';
import Spinner from '../components/Spinner';

interface EleveSummary {
  profile: Profile;
  attendance: ReturnType<typeof monthAttendance>;
  lastDate: string | null;
  percent: number;
  juzAcquired: number;
}

export default function AdminDashboard() {
  const [rows, setRows] = useState<EleveSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      // 1) Les élèves.
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'eleve')
        .order('full_name');

      if (pErr) {
        if (active) {
          setError('Impossible de charger les élèves.');
          setLoading(false);
        }
        return;
      }

      // 2) Tous les logs + états (le prof lit tout grâce aux policies).
      const [{ data: logs }, { data: states }] = await Promise.all([
        supabase.from('daily_logs').select('eleve_id, log_date'),
        supabase.from('learning_state').select('eleve_id, surah_id'),
      ]);

      if (!active) return;

      const summaries = (profiles as Profile[]).map((profile) => {
        const myLogs = (logs ?? []).filter((l) => l.eleve_id === profile.id);
        const loggedDates = new Set(myLogs.map((l) => l.log_date as string));
        const known = new Set(
          (states ?? [])
            .filter((s) => s.eleve_id === profile.id)
            .map((s) => s.surah_id as number),
        );
        const { percent, juzAcquired } = computeProgress(known);
        const lastDate =
          myLogs.length > 0
            ? myLogs
                .map((l) => l.log_date as string)
                .sort()
                .at(-1)!
            : null;

        return {
          profile,
          attendance: monthAttendance(loggedDates),
          lastDate,
          percent,
          juzAcquired,
        };
      });

      setRows(summaries);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Spinner label="Chargement des élèves…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium text-neutral-900">Élèves</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Assiduité du mois et progression de chacun.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-manque-doux px-3 py-2 text-sm text-manque">
          {error}
        </p>
      )}

      {rows.length === 0 ? (
        <p className="rounded-xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-400">
          Aucun élève inscrit pour l'instant.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rows.map((r) => (
            <EleveCard key={r.profile.id} row={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function EleveCard({ row }: { row: EleveSummary }) {
  const { profile, attendance, lastDate, percent, juzAcquired } = row;
  const missed = attendance.expected - attendance.done;
  // Mise en évidence : pas loggé aujourd'hui, ou jours manqués récents.
  const alert = !attendance.doneToday || missed > 0;

  return (
    <Link
      to={`/admin/eleve/${profile.id}`}
      className={
        'block rounded-xl border bg-white p-5 transition-colors hover:border-neutral-300 ' +
        (alert ? 'border-manque/40' : 'border-neutral-200')
      }
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-neutral-900">
          {profile.full_name || 'Élève sans nom'}
        </span>
        {!attendance.doneToday && (
          <span className="rounded-full bg-manque-doux px-2 py-0.5 text-[11px] font-medium text-manque">
            pas révisé aujourd'hui
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-xs text-neutral-400">Assiduité (mois)</div>
          <div
            className={
              'mt-0.5 font-medium ' +
              (missed > 0 ? 'text-manque' : 'text-neutral-800')
            }
          >
            {attendance.done} / {attendance.expected} jours
          </div>
        </div>
        <div>
          <div className="text-xs text-neutral-400">Progression</div>
          <div className="mt-0.5 font-medium text-neutral-800">
            {percent}% · {juzAcquired} juz
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-neutral-400">
        {lastDate
          ? `Dernière révision : ${formatLongDate(lastDate)}`
          : 'Aucune révision enregistrée'}
      </div>
    </Link>
  );
}
