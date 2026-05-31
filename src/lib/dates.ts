// Utilitaires de dates, en heure locale (évite les décalages UTC sur log_date).

/** Formate une Date en 'YYYY-MM-DD' en heure locale. */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Date d'aujourd'hui en 'YYYY-MM-DD' (heure locale). */
export function todayISO(): string {
  return toISODate(new Date());
}

const MOIS = [
  'janvier','février','mars','avril','mai','juin',
  'juillet','août','septembre','octobre','novembre','décembre',
];

/** Ex. "mai 2026". */
export function monthLabel(year: number, month0: number): string {
  return `${MOIS[month0]} ${year}`;
}

/** Ex. "31 mai 2026" à partir d'une chaîne 'YYYY-MM-DD'. */
export function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MOIS[m - 1]} ${y}`;
}

/**
 * Calcule la série (streak) : nombre de jours consécutifs jusqu'à aujourd'hui
 * avec au moins un log. Si aujourd'hui n'a pas de log mais hier oui, la série
 * court jusqu'à hier (on n'a pas encore "raté" aujourd'hui tant qu'il dure).
 */
export function computeStreak(loggedDates: Set<string>): number {
  let streak = 0;
  const cursor = new Date();

  // Si aujourd'hui n'est pas loggé, on démarre le décompte à partir d'hier.
  if (!loggedDates.has(toISODate(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (loggedDates.has(toISODate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export interface CalendarCell {
  iso: string;
  day: number;
  inMonth: boolean;
}

/**
 * Construit la grille d'un mois (semaines commençant le lundi), avec
 * les jours de remplissage avant/après pour aligner sur 7 colonnes.
 */
export function buildMonthGrid(year: number, month0: number): CalendarCell[] {
  const first = new Date(year, month0, 1);
  // getDay() : 0=dimanche … 6=samedi. On veut lundi=0.
  const firstWeekday = (first.getDay() + 6) % 7;

  const cells: CalendarCell[] = [];
  // Jours du mois précédent pour compléter la première semaine.
  for (let i = firstWeekday; i > 0; i--) {
    const d = new Date(year, month0, 1 - i);
    cells.push({ iso: toISODate(d), day: d.getDate(), inMonth: false });
  }

  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month0, day);
    cells.push({ iso: toISODate(d), day, inMonth: true });
  }

  // Compléter jusqu'à un multiple de 7.
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1];
    const [y, m, dd] = last.iso.split('-').map(Number);
    const d = new Date(y, m - 1, dd + 1);
    cells.push({ iso: toISODate(d), day: d.getDate(), inMonth: false });
  }

  return cells;
}
