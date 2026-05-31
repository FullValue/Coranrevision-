import { SURAH_NAMES } from '../data/quran';

/** Menu déroulant listant les 114 sourates au format "1. Al-Fatiha". */
export default function SurahSelect({
  id,
  label,
  value,
  onChange,
}: {
  id?: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-neutral-600">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-fait-fort focus:ring-2 focus:ring-fait-doux"
      >
        {SURAH_NAMES.map((name, i) => (
          <option key={i + 1} value={i + 1}>
            {i + 1}. {name}
          </option>
        ))}
      </select>
    </label>
  );
}
