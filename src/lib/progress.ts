import {
  SURAH_VERSES,
  TOTAL_VERSES,
  JUZ_SURAH_RANGES,
} from '../data/quran';

export interface ProgressStats {
  /** Nombre de sourates connues. */
  knownSurahs: number;
  /** % de progression pondéré par les versets (arrondi). */
  percent: number;
  /** Nombre de juz acquis (toutes les sourates de l'intervalle connues). */
  juzAcquired: number;
}

/**
 * Calcule les trois indicateurs de progression à partir de l'ensemble
 * des sourates connues (1-indexées).
 *
 * - knownSurahs : taille du set.
 * - percent : round( (somme des versets connus) / 6236 * 100 ) — pondéré versets.
 * - juzAcquired : nombre de juz dont TOUTES les sourates de l'intervalle
 *   JUZ_SURAH_RANGES[i] sont dans le set (règle stricte).
 */
export function computeProgress(known: Set<number>): ProgressStats {
  let versesKnown = 0;
  for (const id of known) {
    versesKnown += SURAH_VERSES[id - 1] ?? 0;
  }

  const percent = Math.round((versesKnown / TOTAL_VERSES) * 100);

  let juzAcquired = 0;
  for (const [from, to] of JUZ_SURAH_RANGES) {
    let allKnown = true;
    for (let s = from; s <= to; s++) {
      if (!known.has(s)) {
        allKnown = false;
        break;
      }
    }
    if (allKnown) juzAcquired += 1;
  }

  return {
    knownSurahs: known.size,
    percent,
    juzAcquired,
  };
}
