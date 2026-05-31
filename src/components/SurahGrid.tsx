import { SURAH_NAMES } from '../data/quran';

/**
 * Grille des 114 sourates (2 colonnes), format "N. Nom".
 * - sourate connue = pastille verte ;
 * - sinon neutre avec bordure.
 * En mode lecture seule (`readOnly`), aucun clic n'est possible (vue prof).
 */
export default function SurahGrid({
  known,
  onToggle,
  readOnly = false,
}: {
  known: Set<number>;
  onToggle?: (id: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
      {SURAH_NAMES.map((name, i) => {
        const id = i + 1;
        const isKnown = known.has(id);
        const base =
          'flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors';
        const state = isKnown
          ? 'border-fait bg-fait-doux text-neutral-800'
          : 'border-neutral-200 bg-white text-neutral-600';
        const interactive = readOnly
          ? 'cursor-default'
          : 'hover:border-neutral-300';

        const content = (
          <>
            <span
              className={
                'h-3 w-3 shrink-0 rounded-full ' +
                (isKnown
                  ? 'bg-fait-fort'
                  : 'border border-neutral-300 bg-transparent')
              }
            />
            <span className="truncate">
              <span className="text-neutral-400">{id}.</span> {name}
            </span>
          </>
        );

        if (readOnly) {
          return (
            <div key={id} className={`${base} ${state} ${interactive}`}>
              {content}
            </div>
          );
        }

        return (
          <button
            key={id}
            type="button"
            onClick={() => onToggle?.(id)}
            aria-pressed={isKnown}
            className={`${base} ${state} ${interactive}`}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
