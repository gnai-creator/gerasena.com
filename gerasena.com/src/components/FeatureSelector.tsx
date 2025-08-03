"use client";

interface Props {
  features: string[];
  selected: Record<string, number>;
  onToggle: (feature: string) => void;
  onChange: (feature: string, value: number) => void;
}

export function FeatureSelector({ features, selected, onToggle, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {features.map((f) => (
        <label key={f} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={f in selected}
            onChange={() => onToggle(f)}
            className="h-4 w-4"
          />
          <span className="capitalize">{f.replace(/_/g, " ")}</span>
          <input
            type="number"
            className="ml-auto w-20 rounded border px-1 py-0.5"
            value={selected[f] ?? ""}
            disabled={!(f in selected)}
            onChange={(e) => onChange(f, Number(e.target.value))}
          />
        </label>
      ))}
    </div>
  );
}
