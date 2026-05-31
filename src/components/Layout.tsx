import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import NotificationBell from './NotificationBell';

/** En-tête + zone de contenu. La navigation dépend du rôle. */
export default function Layout() {
  const { profile, signOut } = useAuth();
  const isProf = profile?.role === 'prof';

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    [
      'rounded-lg px-1.5 py-1.5 text-sm transition-colors sm:px-3',
      isActive
        ? 'bg-fait-doux text-fait-fort font-medium'
        : 'text-neutral-600 hover:bg-neutral-100',
    ].join(' ');

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-4">
          <Link
            to={isProf ? '/admin' : '/'}
            className="flex shrink-0 items-center gap-2 text-neutral-900"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-fait-fort text-sm text-white">
              ٱ
            </span>
            {/* Texte du logo masqué sur très petit écran pour libérer de la place. */}
            <span className="hidden text-sm font-medium min-[420px]:inline sm:text-base">
              Suivi de révision
            </span>
          </Link>

          <nav className="flex items-center gap-0.5 sm:gap-1">
            {isProf ? (
              <NavLink to="/admin" end className={navItemClass}>
                Élèves
              </NavLink>
            ) : (
              <>
                <NavLink to="/" end className={navItemClass}>
                  Révision
                </NavLink>
                <NavLink to="/progression" className={navItemClass}>
                  {/* Libellé court sur mobile, complet dès sm. */}
                  <span className="sm:hidden">Progression</span>
                  <span className="hidden sm:inline">Ma progression</span>
                </NavLink>
              </>
            )}
            <NotificationBell />
            {/* Déconnexion : icône seule sur mobile, texte dès sm. */}
            <button
              onClick={signOut}
              aria-label="Déconnexion"
              title="Déconnexion"
              className="ml-0.5 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 sm:ml-1 sm:px-3"
            >
              <LogoutIcon />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}
