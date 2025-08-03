"use client";

interface Props {
  features: string[];
  selected: Record<string, number | [number, number]>;
  onToggle: (feature: string) => void;
  onChange: (feature: string, value: number | [number, number]) => void;
}

import { FEATURE_INFO } from "@/lib/features";

export function FeatureSelector({ features, selected, onToggle, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {features.map((f) => {
        const isRange = f === "sum";
        const active = f in selected;
        const value = selected[f];
        const [min, max] = Array.isArray(value) ? value : ["", ""];
        return (
          <div key={f} className="flex items-center gap-2">
            <input
              id={`feature-${f}`}
              type="checkbox"
              checked={active}
              onChange={() => onToggle(f)}
              className="h-4 w-4"
            />
            <label htmlFor={`feature-${f}`} className="capitalize">
              {FEATURE_INFO[f].label}
            </label>
            <button
              type="button"
              title={FEATURE_INFO[f].description}
              className="h-4 w-4 rounded-full bg-gray-200 text-xs text-black"
            >
              i
            </button>
            {isRange ? (
              <div className="ml-auto flex items-center gap-1">
                <input
                  type="number"
                  className="w-20 rounded border px-1 py-0.5"
                  value={min as number | string}
                  disabled={!active}
                  onChange={(e) =>
                    onChange(f, [Number(e.target.value), Number(max || 0)])
                  }
                />
                <span>-</span>
                <input
                  type="number"
                  className="w-20 rounded border px-1 py-0.5"
                  value={max as number | string}
                  disabled={!active}
                  onChange={(e) =>
                    onChange(f, [Number(min || 0), Number(e.target.value)])
                  }
                />
              </div>
            ) : (
              <input
                type="number"
                className="ml-auto w-20 rounded border px-1 py-0.5"
                value={(value as number) ?? ""}
                disabled={!active}
                onChange={(e) => onChange(f, Number(e.target.value))}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
