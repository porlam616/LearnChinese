export default function ProgressBar({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? 'bg-green-500' : value >= 35 ? 'bg-amber-500' : 'bg-neutral-400';
  return (
    <div className="flex-1">
      <div className="flex justify-between text-xs text-neutral-500 mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${Math.max(value, 1)}%` }} />
      </div>
    </div>
  );
}
