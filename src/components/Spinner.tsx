/** Petit indicateur de chargement centré. */
export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-neutral-500">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-fait-fort" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
