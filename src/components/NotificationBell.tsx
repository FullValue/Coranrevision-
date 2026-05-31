import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import type { DailyLog, Profile } from '../lib/types';
import {
  buildEleveNotifications,
  buildProfNotifications,
  loadReadIds,
  saveReadIds,
  type AppNotification,
  type EleveLogsBundle,
  type NotifTone,
} from '../lib/notifications';

// Styles de pastille par ton, alignés sur la palette sémantique du thème.
const TONE_STYLES: Record<NotifTone, string> = {
  rappel: 'bg-encours/15 text-encours',
  felicitation: 'bg-fait-doux text-fait-fort',
  info: 'bg-neutral-100 text-neutral-600',
  alerte: 'bg-manque-doux text-manque',
};

/**
 * Cloche de notifications in-app. Charge les données selon le rôle, dérive
 * les notifications, et gère le statut lu/non-lu (localStorage).
 */
export default function NotificationBell() {
  const { user, profile } = useAuth();
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const userId = user?.id ?? null;
  const isProf = profile?.role === 'prof';

  // Charge les données + les ids lus, et dérive les notifications.
  // (Lecture du localStorage faite ici, de façon asynchrone, pour éviter
  // un setState synchrone dans le corps de l'effet.)
  useEffect(() => {
    if (!userId || !profile) return;
    let active = true;

    (async () => {
      if (isProf) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'eleve')
          .order('full_name');
        const { data: logs } = await supabase
          .from('daily_logs')
          .select('*');
        if (!active) return;

        const allLogs = (logs ?? []) as DailyLog[];
        const bundles: EleveLogsBundle[] = (profiles as Profile[] ?? []).map(
          (p) => ({
            profile: p,
            logs: allLogs.filter((l) => l.eleve_id === p.id),
          }),
        );
        setReadIds(loadReadIds(userId));
        setNotifs(buildProfNotifications(bundles));
      } else {
        const { data: logs } = await supabase
          .from('daily_logs')
          .select('*')
          .eq('eleve_id', userId);
        if (!active) return;
        setReadIds(loadReadIds(userId));
        setNotifs(buildEleveNotifications((logs ?? []) as DailyLog[]));
      }
    })();

    return () => {
      active = false;
    };
  }, [userId, profile, isProf]);

  // Ferme le panneau au clic extérieur / touche Échap.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const unreadCount = useMemo(
    () => notifs.filter((n) => !readIds.has(n.id)).length,
    [notifs, readIds],
  );

  function markAllRead() {
    if (!userId) return;
    const next = new Set(readIds);
    notifs.forEach((n) => next.add(n.id));
    setReadIds(next);
    saveReadIds(userId, next);
  }

  function toggle() {
    const next = !open;
    setOpen(next);
    // À l'ouverture, on considère les notifs comme vues.
    if (next) markAllRead();
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={toggle}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} non lue(s)`
            : 'Notifications'
        }
        className="relative grid h-9 w-9 place-items-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-manque px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-2.5">
            <span className="text-sm font-medium text-neutral-800">
              Notifications
            </span>
            <span className="text-xs text-neutral-400">
              {isProf ? 'Espace prof' : 'Mes rappels'}
            </span>
          </div>

          {notifs.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-neutral-400">
              Rien à signaler pour l'instant.
            </p>
          ) : (
            <ul className="max-h-96 divide-y divide-neutral-100 overflow-y-auto">
              {notifs.map((n) => (
                <li key={n.id} className="flex gap-3 px-4 py-3">
                  <span
                    className={
                      'grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm ' +
                      TONE_STYLES[n.tone]
                    }
                    aria-hidden
                  >
                    {n.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-800">
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
                      {n.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function BellIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
