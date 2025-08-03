"use client";

interface Props {
  features: string[];
  selected: string[];
  onToggle: (feature: string) => void;
}

export function FeatureSelector({ features, selected, onToggle }: Props) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {features.map((f) => (
        <label key={f} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selected.includes(f)}
            onChange={() => onToggle(f)}
            className="h-4 w-4"
          />
          <span className="capitalize">{f.replace(/_/g, " ")}</span>
        </label>
      ))}
    </div>
  );
}
