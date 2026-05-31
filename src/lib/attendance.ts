import { toISODate, todayISO } from './dates';

export interface MonthAttendance {
  /** Jours du mois courant déjà écoulés (jusqu'à aujourd'hui inclus). */
  expected: number;
  /** Parmi eux, ceux avec au moins un log. */
  done: number;
  /** A-t-il loggé aujourd'hui ? */
  doneToday: boolean;
}

/**
 * Assiduité sur le mois en cours : attendu = jours écoulés du mois (1 → aujourd'hui),
 * fait = ceux couverts par un log. Règle v1 : tous les jours sont attendus.
 */
export function monthAttendance(loggedDates: Set<string>): MonthAttendance {
  const now = new Date();
  const year = now.getFullYear();
  const month0 = now.getMonth();
  const today = todayISO();

  let expected = 0;
  let done = 0;
  for (let day = 1; day <= now.getDate(); day++) {
    const iso = toISODate(new Date(year, month0, day));
    expected += 1;
    if (loggedDates.has(iso)) done += 1;
  }

  return { expected, done, doneToday: loggedDates.has(today) };
}
