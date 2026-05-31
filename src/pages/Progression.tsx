import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import ProgressSummary from '../components/ProgressSummary';
import SurahGrid from '../components/SurahGrid';

export default function Progression() {
  const { user } = useAuth();
  const eleveId = user!.id;

  const [known, setKnown] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from('learning_state')
        .select('surah_id')
        .eq('eleve_id', eleveId);
      if (!active) return;
      if (error) {
        setError('Impossible de charger votre progression.');
      } else {
        setKnown(new Set((data ?? []).map((r) => r.surah_id as number)));
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [eleveId]);

  async function toggle(id: number) {
    setError(null);
    const wasKnown = known.has(id);

    // Mise à jour optimiste (recalcul en direct).
    setKnown((prev) => {
      const next = new Set(prev);
      if (wasKnown) next.delete(id);
      else next.add(id);
      return next;
    });

    const { error } = wasKnown
      ? await supabase
          .from('learning_state')
          .delete()
          .eq('eleve_id', eleveId)
          .eq('surah_id', id)
      : await supabase
          .from('learning_state')
          .insert({ eleve_id: eleveId, surah_id: id });

    if (error) {
      // Annule l'optimisme en cas d'échec.
      setError('La mise à jour a échoué.');
      setKnown((prev) => {
        const next = new Set(prev);
        if (wasKnown) next.add(id);
        else next.delete(id);
        return next;
      });
    }
  }

  if (loading) return <Spinner label="Chargement de votre progression…" />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium text-neutral-900">Ma progression</h1>

      {error && (
        <p className="rounded-lg bg-manque-doux px-3 py-2 text-sm text-manque">
          {error}
        </p>
      )}

      <Card>
        <ProgressSummary known={known} />
      </Card>

      <Card>
        <h2 className="mb-1 text-sm font-medium text-neutral-800">
          Les 114 sourates
        </h2>
        <p className="mb-4 text-xs text-neutral-500">
          Touchez une sourate pour la marquer comme connue. Les indicateurs se
          recalculent en direct.
        </p>
        <SurahGrid known={known} onToggle={toggle} />
      </Card>
    </div>
  );
}
