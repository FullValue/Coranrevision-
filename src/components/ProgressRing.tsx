/**
 * Anneau de progression SVG.
 * Affiche un pourcentage au centre ; l'arc utilise stroke-dasharray sur
 * une circonférence 2·π·r.
 */
export default function ProgressRing({
  percent,
  size = 168,
  stroke = 12,
}: {
  percent: number;
  size?: number;
  stroke?: number;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - clamped / 100);
  const center = size / 2;

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-neutral-200"
        />
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-fait-fort transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-medium text-neutral-900">
          {clamped}
          <span className="text-lg text-neutral-400">%</span>
        </span>
        <span className="text-xs text-neutral-400">de progression</span>
      </div>
    </div>
  );
}
