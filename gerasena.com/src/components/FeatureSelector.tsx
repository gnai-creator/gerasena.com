"use client";

interface Props {
  features: string[];
  selected: Record<string, number>;
  onToggle: (feature: string) => void;
  onChange: (feature: string, value: number) => void;
}

import { FEATURE_INFO } from "@/lib/features";

export function FeatureSelector({ features, selected, onToggle, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {features.map((f) => (
        <div key={f} className="flex items-center gap-2">
          <input
            id={`feature-${f}`}
            type="checkbox"
            checked={f in selected}
            onChange={() => onToggle(f)}
            className="h-4 w-4"
          />
          <label htmlFor={`feature-${f}`} className="capitalize">
            {FEATURE_INFO[f].label}
          </label>
          <button
            type="button"
            title={FEATURE_INFO[f].description}
            className="h-4 w-4 rounded-full bg-gray-200 text-xs"
          >
            i
          </button>
          <input
            type="number"
            className="ml-auto w-20 rounded border px-1 py-0.5"
            value={selected[f] ?? ""}
            disabled={!(f in selected)}
            onChange={(e) => onChange(f, Number(e.target.value))}
          />
        </div>
      ))}
    </div>
  );
}
