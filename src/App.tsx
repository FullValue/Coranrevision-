import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { isSupabaseConfigured } from './lib/supabase';
import Spinner from './components/Spinner';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Revision from './pages/Revision';
import Progression from './pages/Progression';
import AdminDashboard from './pages/AdminDashboard';
import AdminEleveDetail from './pages/AdminEleveDetail';

/** Redirige un visiteur déjà connecté loin des pages d'auth. */
function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner label="Chargement…" />
      </div>
    );
  }
  if (user && profile) {
    return <Navigate to={profile.role === 'prof' ? '/admin' : '/'} replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Pages publiques */}
      <Route
        path="/login"
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnly>
            <Signup />
          </PublicOnly>
        }
      />

      {/* Espace élève */}
      <Route
        element={
          <ProtectedRoute allow="eleve">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Revision />} />
        <Route path="/progression" element={<Progression />} />
      </Route>

      {/* Espace admin / professeur */}
      <Route
        element={
          <ProtectedRoute allow="prof">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/eleve/:id" element={<AdminEleveDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function MissingConfig() {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6">
        <h1 className="text-lg font-medium text-neutral-900">
          Configuration Supabase manquante
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Crée un fichier <code className="rounded bg-neutral-100 px-1">.env</code>{' '}
          à la racine du projet avec :
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-neutral-900 p-3 text-xs text-neutral-100">
          {`VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...`}
        </pre>
        <p className="mt-3 text-sm text-neutral-500">
          Puis redémarre le serveur de développement. Voir le fichier{' '}
          <code className="rounded bg-neutral-100 px-1">.env.example</code> et le
          README.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  if (!isSupabaseConfigured) {
    return <MissingConfig />;
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
