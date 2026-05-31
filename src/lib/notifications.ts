// =====================================================================
// Notifications in-app, DÉRIVÉES des données existantes (aucune table).
//
// Principe : à chaque ouverture, on recalcule la liste des notifications
// pertinentes selon le rôle et l'état courant (logs, streak, assiduité…).
// L'état « lu » est mémorisé localement (localStorage), par utilisateur.
//
// Chaque notification a un `id` STABLE et déterministe (souvent basé sur
// une date), pour qu'une même notif ne « repasse » pas en non-lue d'un
// rendu à l'autre, et qu'on puisse la marquer lue durablement.
// =====================================================================

import type { DailyLog, Profile } from './types';
import { computeStreak, todayISO, toISODate } from './dates';

export type NotifTone = 'rappel' | 'felicitation' | 'info' | 'alerte';

export interface AppNotification {
  /** Identifiant stable (sert de clé de lu/non-lu). */
  id: string;
  tone: NotifTone;
  /** Emoji d'illustration. */
  icon: string;
  title: string;
  body: string;
  /** Date ISO de rattachement (tri anti-chronologique). */
  date: string;
}

// ---------------------------------------------------------------------
// Lu / non-lu — persistance locale (par utilisateur, par appareil).
// ---------------------------------------------------------------------

function storageKey(userId: string): string {
  return `qr.notifs.read.${userId}`;
}

/** Ensemble des ids de notifications déjà lues par cet utilisateur. */
export function loadReadIds(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function saveReadIds(userId: string, ids: Set<string>): void {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify([...ids]));
  } catch {
    // Stockage indisponible (mode privé strict) : on ignore silencieusement.
  }
}

// ---------------------------------------------------------------------
// Helpers de dates.
// ---------------------------------------------------------------------

/** Nombre de jours pleins entre deux dates ISO 'YYYY-MM-DD' (b - a). */
function daysBetween(aIso: string, bIso: string): number {
  const [ay, am, ad] = aIso.split('-').map(Number);
  const [by, bm, bd] = bIso.split('-').map(Number);
  const a = new Date(ay, am - 1, ad).getTime();
  const b = new Date(by, bm - 1, bd).getTime();
  return Math.round((b - a) / 86_400_000);
}

/** Identifiant ISO de la semaine (lundi) contenant `today`. */
function weekAnchorISO(today: string): string {
  const [y, m, d] = today.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const isoWeekday = (date.getDay() + 6) % 7; // lundi = 0
  date.setDate(date.getDate() - isoWeekday);
  return toISODate(date);
}

const firstName = (p: Pick<Profile, 'full_name'>) =>
  p.full_name?.split(' ')[0] || 'Élève';

// Paliers de série qui déclenchent une félicitation.
const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

// ---------------------------------------------------------------------
// Notifications ÉLÈVE.
// ---------------------------------------------------------------------

/**
 * Construit les notifications de l'élève à partir de ses propres logs.
 * `today` est injecté (par défaut aujourd'hui) pour rester testable.
 */
export function buildEleveNotifications(
  logs: DailyLog[],
  today: string = todayISO(),
): AppNotification[] {
  const out: AppNotification[] = [];
  const loggedDates = new Set(logs.map((l) => l.log_date));
  const doneToday = loggedDates.has(today);
  const streak = computeStreak(loggedDates);

  // 1) Rappel quotidien — uniquement si la révision du jour manque.
  if (!doneToday) {
    out.push({
      id: `eleve.rappel.${today}`,
      tone: 'rappel',
      icon: '📖',
      title: "Ta révision du jour t'attend",
      body:
        streak > 0
          ? `Tu es à ${streak} ${streak > 1 ? 'jours' : 'jour'} de série — ne casse pas la chaîne, révise aujourd'hui.`
          : "Enregistre ta révision d'aujourd'hui pour repartir sur une série.",
      date: today,
    });
  }

  // 2) Félicitation de série — au palier atteint, le jour de la dernière révision.
  if (doneToday && STREAK_MILESTONES.includes(streak)) {
    out.push({
      id: `eleve.streak.${streak}.${today}`,
      tone: 'felicitation',
      icon: '🔥',
      title: `${streak} jours d'affilée, maa shaa Allah !`,
      body: 'Continue sur cette lancée, la régularité est la clé de la mémorisation.',
      date: today,
    });
  } else if (doneToday) {
    // Encouragement simple le jour où l'élève a révisé.
    out.push({
      id: `eleve.done.${today}`,
      tone: 'felicitation',
      icon: '✅',
      title: 'Révision enregistrée',
      body:
        streak > 1
          ? `Bravo, ${streak} jours de série. À demain in shaa Allah.`
          : 'Bravo, reviens demain pour bâtir ta série.',
      date: today,
    });
  }

  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
}

// ---------------------------------------------------------------------
// Notifications PROF.
// ---------------------------------------------------------------------

/** Seuil (en jours) au-delà duquel un élève est signalé comme décroché. */
export const DECROCHAGE_SEUIL = 3;

export interface EleveLogsBundle {
  profile: Profile;
  logs: DailyLog[]; // logs de CET élève
}

/**
 * Construit les notifications du prof à partir des logs de tous les élèves.
 */
export function buildProfNotifications(
  eleves: EleveLogsBundle[],
  today: string = todayISO(),
): AppNotification[] {
  const out: AppNotification[] = [];

  for (const { profile, logs } of eleves) {
    const name = firstName(profile);
    const loggedDates = new Set(logs.map((l) => l.log_date));
    const dates = [...loggedDates].sort();
    const lastDate = dates.at(-1) ?? null;

    // a) A révisé aujourd'hui.
    if (loggedDates.has(today)) {
      out.push({
        id: `prof.done.${profile.id}.${today}`,
        tone: 'info',
        icon: '✅',
        title: `${name} a révisé aujourd'hui`,
        body: 'Sa révision du jour est enregistrée.',
        date: today,
      });
    }

    // b) Décrochage : aucune révision depuis ≥ seuil jours (ou jamais).
    if (!lastDate) {
      out.push({
        id: `prof.jamais.${profile.id}`,
        tone: 'alerte',
        icon: '⚠️',
        title: `${name} n'a aucune révision`,
        body: "Cet élève n'a encore rien enregistré.",
        date: today,
      });
    } else {
      const gap = daysBetween(lastDate, today);
      if (gap >= DECROCHAGE_SEUIL) {
        out.push({
          // Id rattaché au jour : se renouvelle chaque jour tant que ça dure.
          id: `prof.decrochage.${profile.id}.${today}`,
          tone: 'alerte',
          icon: '⚠️',
          title: `${name} a décroché`,
          body: `Aucune révision depuis ${gap} jours (dernière le ${lastDate}).`,
          date: today,
        });
      }
    }
  }

  // c) Résumé hebdomadaire — un seul par semaine, ancré au lundi.
  const week = weekAnchorISO(today);
  const totalThisWeek = eleves.reduce((sum, e) => {
    const inWeek = e.logs.filter(
      (l) => l.log_date >= week && l.log_date <= today,
    ).length;
    return sum + inWeek;
  }, 0);
  const activeThisWeek = eleves.filter((e) =>
    e.logs.some((l) => l.log_date >= week && l.log_date <= today),
  ).length;

  out.push({
    id: `prof.hebdo.${week}`,
    tone: 'info',
    icon: '📊',
    title: 'Résumé de la semaine',
    body: `${activeThisWeek}/${eleves.length} élève(s) actif(s) cette semaine · ${totalThisWeek} révision(s) enregistrée(s).`,
    date: week,
  });

  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
}
