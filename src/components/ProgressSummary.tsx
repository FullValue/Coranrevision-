import ProgressRing from './ProgressRing';
import { computeProgress } from '../lib/progress';
import { TOTAL_JUZ, TOTAL_SURAHS } from '../data/quran';

/**
 * Synthèse de progression : anneau (% pondéré versets) + cartes
 * "Juz acquis X / 30" et "Sourates Y / 114".
 * Réutilisée côté élève et côté admin (lecture).
 */
export default function ProgressSummary({ known }: { known: Set<number> }) {
  const { percent, juzAcquired, knownSurahs } = computeProgress(known);

  return (
    <div className="flex flex-col items-center gap-6">
      <ProgressRing percent={percent} />
      <div className="grid w-full grid-cols-2 gap-3">
        <Stat label="Juz acquis" value={`${juzAcquired} / ${TOTAL_JUZ}`} />
        <Stat label="Sourates" value={`${knownSurahs} / ${TOTAL_SURAHS}`} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-center">
      <div className="text-xl font-medium text-neutral-900">{value}</div>
      <div className="mt-0.5 text-xs text-neutral-500">{label}</div>
    </div>
  );
}
