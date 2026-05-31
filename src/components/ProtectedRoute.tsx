import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import type { UserRole } from '../lib/types';
import Spinner from './Spinner';

/**
 * Protège une branche de routes :
 * - non connecté → /login
 * - rôle non autorisé → renvoyé vers son espace par défaut.
 */
export default function ProtectedRoute({
  allow,
  children,
}: {
  allow: UserRole;
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner label="Chargement…" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Le profil peut être en cours de création par le trigger juste après signup.
  if (!profile) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner label="Préparation de votre espace…" />
      </div>
    );
  }

  if (profile.role !== allow) {
    // Renvoie chacun vers son espace.
    return <Navigate to={profile.role === 'prof' ? '/admin' : '/'} replace />;
  }

  return <>{children}</>;
}
