/** Surface blanche, bordure fine, coins arrondis — la brique visuelle de base. */
export default function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-neutral-200 bg-white p-5 ${className}`}
    >
      {children}
    </div>
  );
}
