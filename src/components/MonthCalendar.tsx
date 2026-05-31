import { useState } from 'react';
import {
  buildMonthGrid,
  monthLabel,
  todayISO,
} from '../lib/dates';

const WEEKDAYS = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];

/**
 * Calendrier mensuel d'assiduité.
 * - jour avec ≥ 1 log → vert
 * - jour passé sans log → rouge
 * - aujourd'hui → contour mis en évidence (vert si déjà loggé)
 * - jour futur → neutre/gris
 *
 * Règle v1 : tous les jours sont attendus. Le paramètre optionnel `isOffDay`
 * permet d'ajouter plus tard des "jours off" sans refonte (un jour off vide
 * n'est pas marqué rouge).
 */
export default function MonthCalendar({
  loggedDates,
  isOffDay,
}: {
  loggedDates: Set<string>;
  isOffDay?: (iso: string) => boolean;
}) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month0, setMonth0] = useState(now.getMonth());

  const today = todayISO();
  const cells = buildMonthGrid(year, month0);

  function shift(delta: number) {
    const d = new Date(year, month0 + delta, 1);
    setYear(d.getFullYear());
    setMonth0(d.getMonth());
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => shift(-1)}
          aria-label="Mois précédent"
          className="grid h-8 w-8 place-items-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100"
        >
          ‹
        </button>
        <span className="text-sm font-medium text-neutral-800">
          {monthLabel(year, month0)}
        </span>
        <button
          onClick={() => shift(1)}
          aria-label="Mois suivant"
          className="grid h-8 w-8 place-items-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100"
        >
          ›
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] text-neutral-400">
        {WEEKDAYS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const logged = loggedDates.has(cell.iso);
          const isToday = cell.iso === today;
          const isPast = cell.iso < today;
          const off = isOffDay?.(cell.iso) ?? false;

          let cls =
            'aspect-square grid place-items-center rounded-lg text-sm select-none ';

          if (!cell.inMonth) {
            cls += 'text-neutral-300';
          } else if (logged) {
            cls += 'bg-fait-doux text-fait-fort font-medium';
          } else if (off) {
            cls += 'text-neutral-400'; // jour off non rempli : neutre
          } else if (isPast) {
            cls += 'bg-manque-doux text-manque';
          } else if (isToday) {
            cls += 'text-neutral-700';
          } else {
            cls += 'text-neutral-400'; // futur
          }

          if (isToday) {
            cls += logged
              ? ' ring-2 ring-fait-fort'
              : ' ring-2 ring-neutral-400';
          }

          return (
            <div key={cell.iso} className={cls} title={cell.iso}>
              {cell.day}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-500">
        <Legend className="bg-fait-doux" label="révisé" />
        <Legend className="bg-manque-doux" label="manqué" />
        <Legend className="ring-2 ring-neutral-400" label="aujourd'hui" />
        <Legend className="bg-neutral-100" label="à venir" />
      </div>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`inline-block h-3 w-3 rounded ${className}`} />
      {label}
    </span>
  );
}
