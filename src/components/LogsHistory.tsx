import type { DailyLog } from '../lib/types';
import { surahLabel } from '../data/quran';
import { formatLongDate } from '../lib/dates';

/** Historique des révisions : date, « de X à Y », note. */
export default function LogsHistory({ logs }: { logs: DailyLog[] }) {
  if (logs.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-neutral-400">
        Aucune révision enregistrée pour l'instant.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-neutral-100">
      {logs.map((log) => (
        <li key={log.id} className="flex flex-col gap-0.5 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-neutral-800">
              {formatLongDate(log.log_date)}
            </span>
            <span className="text-xs text-neutral-500">
              {log.surah_from === log.surah_to
                ? surahLabel(log.surah_from)
                : `${surahLabel(log.surah_from)} → ${surahLabel(log.surah_to)}`}
            </span>
          </div>
          {log.note && (
            <p className="text-xs text-neutral-500">{log.note}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
