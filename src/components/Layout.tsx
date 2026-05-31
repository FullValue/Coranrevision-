import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import NotificationBell from './NotificationBell';

/** En-tête + zone de contenu. La navigation dépend du rôle. */
export default function Layout() {
  const { profile, signOut } = useAuth();
  const isProf = profile?.role === 'prof';

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    [
      'rounded-lg px-3 py-1.5 text-sm transition-colors',
      isActive
        ? 'bg-fait-doux text-fait-fort font-medium'
        : 'text-neutral-600 hover:bg-neutral-100',
    ].join(' ');

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link
            to={isProf ? '/admin' : '/'}
            className="flex items-center gap-2 text-neutral-900"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-fait-fort text-sm text-white">
              ٱ
            </span>
            <span className="text-sm font-medium sm:text-base">
              Suivi de révision
            </span>
          </Link>

          <nav className="flex items-center gap-1">
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
                  Ma progression
                </NavLink>
              </>
            )}
            <NotificationBell />
            <button
              onClick={signOut}
              className="ml-1 rounded-lg px-3 py-1.5 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
            >
              Déconnexion
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
