import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AuthShell, Field } from './Login';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        // Transmis au trigger handle_new_user → profiles.full_name.
        data: { full_name: fullName.trim() },
      },
    });

    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }

    // Si la confirmation d'email est activée, aucune session n'est ouverte.
    if (!data.session) {
      setInfo(
        "Compte créé. Vérifiez votre boîte mail pour confirmer l'adresse, " +
          'puis connectez-vous.',
      );
      setBusy(false);
    }
    // Sinon AuthContext prend le relais et redirige vers l'espace élève.
  }

  return (
    <AuthShell
      title="Créer un compte"
      subtitle="Commencez à suivre vos révisions."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Nom complet"
          value={fullName}
          onChange={setFullName}
          autoComplete="name"
          required
        />
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          required
        />
        <Field
          label="Mot de passe"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          required
          minLength={6}
        />

        {error && (
          <p className="rounded-lg bg-manque-doux px-3 py-2 text-sm text-manque">
            {error}
          </p>
        )}
        {info && (
          <p className="rounded-lg bg-fait-doux px-3 py-2 text-sm text-fait-fort">
            {info}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-fait-fort py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-60"
        >
          {busy ? 'Création…' : 'Créer mon compte'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-neutral-500">
        Déjà un compte ?{' '}
        <Link to="/login" className="font-medium text-fait-fort hover:underline">
          Se connecter
        </Link>
      </p>
    </AuthShell>
  );
}
