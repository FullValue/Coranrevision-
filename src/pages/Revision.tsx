import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import type { DailyLog } from '../lib/types';
import { computeStreak, todayISO } from '../lib/dates';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import SurahSelect from '../components/SurahSelect';
import MonthCalendar from '../components/MonthCalendar';
import LogsHistory from '../components/LogsHistory';

export default function Revision() {
  const { user, profile } = useAuth();
  const eleveId = user!.id;

  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(1);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('eleve_id', eleveId)
        .order('log_date', { ascending: false })
        .order('created_at', { ascending: false });
      if (!active) return;
      if (error) {
        setError('Impossible de charger vos révisions.');
      } else {
        setLogs((data ?? []) as DailyLog[]);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [eleveId]);

  const today = todayISO();

  const loggedDates = useMemo(
    () => new Set(logs.map((l) => l.log_date)),
    [logs],
  );
  const streak = useMemo(() => computeStreak(loggedDates), [loggedDates]);
  const todayLogs = useMemo(
    () => logs.filter((l) => l.log_date === today),
    [logs, today],
  );
  const doneToday = todayLogs.length > 0;

  async function handleSubmit() {
    setError(null);
    if (from > to) {
      setError('La sourate de départ doit précéder la sourate d\'arrivée.');
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from('daily_logs')
      .insert({
        eleve_id: eleveId,
        log_date: today,
        surah_from: from,
        surah_to: to,
        note: note.trim() || null,
      })
      .select()
      .single();

    if (error) {
      setError("L'enregistrement a échoué. Réessayez.");
    } else if (data) {
      setLogs((prev) => [data as DailyLog, ...prev]);
      setNote('');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const prev = logs;
    setLogs((l) => l.filter((x) => x.id !== id)); // optimiste
    const { error } = await supabase.from('daily_logs').delete().eq('id', id);
    if (error) {
      setError('La suppression a échoué.');
      setLogs(prev);
    }
  }

  if (loading) return <Spinner label="Chargement de vos révisions…" />;

  const firstName = profile?.full_name?.split(' ')[0] || '';

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <h1 className="text-xl font-medium text-neutral-900">
          {firstName ? `Salam, ${firstName}` : 'Ma révision'}
        </h1>
        <StreakBadge days={streak} />
      </div>

      {/* Carte « Aujourd'hui » */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-800">Aujourd'hui</h2>
          {doneToday && (
            <span className="rounded-full bg-fait-doux px-2.5 py-0.5 text-xs font-medium text-fait-fort">
              ✓ fait
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SurahSelect label="De la sourate" value={from} onChange={setFrom} />
          <SurahSelect label="À la sourate" value={to} onChange={setTo} />
        </div>

        <label className="mt-3 block">
          <span className="mb-1.5 block text-sm text-neutral-600">
            Note (facultatif)
          </span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="ex. mémorisation, révision…"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none transition-colors focus:border-fait-fort focus:ring-2 focus:ring-fait-doux"
          />
        </label>

        {error && (
          <p className="mt-3 rounded-lg bg-manque-doux px-3 py-2 text-sm text-manque">
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="mt-4 w-full rounded-lg bg-fait-fort py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-60"
        >
          {saving
            ? 'Enregistrement…'
            : doneToday
              ? 'Ajouter une autre révision'
              : 'Valider ma révision'}
        </button>

        {doneToday && (
          <ul className="mt-4 space-y-1.5 border-t border-neutral-100 pt-4">
            {todayLogs.map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="text-neutral-700">
                  {l.surah_from === l.surah_to
                    ? `Sourate ${l.surah_from}`
                    : `Sourates ${l.surah_from} → ${l.surah_to}`}
                  {l.note && (
                    <span className="text-neutral-400"> · {l.note}</span>
                  )}
                </span>
                <button
                  onClick={() => handleDelete(l.id)}
                  className="text-xs text-neutral-400 hover:text-manque"
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Calendrier */}
      <Card>
        <h2 className="mb-4 text-sm font-medium text-neutral-800">
          Mon assiduité
        </h2>
        <MonthCalendar loggedDates={loggedDates} />
      </Card>

      {/* Historique */}
      <Card>
        <h2 className="mb-2 text-sm font-medium text-neutral-800">
          Historique
        </h2>
        <LogsHistory logs={logs} />
      </Card>
    </div>
  );
}

function StreakBadge({ days }: { days: number }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm">
      <span aria-hidden>🔥</span>
      <span className="font-medium text-neutral-900">{days}</span>
      <span className="text-neutral-500">
        {days <= 1 ? 'jour' : 'jours'} de série
      </span>
    </span>
  );
}
