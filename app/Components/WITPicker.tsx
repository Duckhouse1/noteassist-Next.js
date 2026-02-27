import React, { useMemo, useRef } from "react";

type WITPickerProps = {
  allWit: string[];
  selected: string[];
  onChange: (next: string[]) => void;
};

export function WITHierarchyPicker({ allWit, selected, onChange }: WITPickerProps) {
  const dragIndexRef = useRef<number | null>(null);

  const available = useMemo(() => {
    const set = new Set(selected);
    return allWit.filter((x) => !set.has(x));
  }, [allWit, selected]);

  const add = (name: string) => onChange([...selected, name]);
  const remove = (name: string) => onChange(selected.filter((x) => x !== name));
  function arrayMove<T>(arr: T[], from: number, to: number) {
    const copy = arr.slice();
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    return copy;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Available */}
      <div className="rounded-xl border border-gray-200 p-3">
        <div className="text-sm font-semibold mb-2">Available WIT</div>

        {available.length === 0 ? (
          <div className="text-xs text-gray-500">Empty</div>
        ) : (
          <ul className="flex flex-col gap-2">
            {available.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => add(name)}
                  className="w-full text-left rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  + {name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Selected / Hierarchy */}
      <div className="rounded-xl border border-gray-200 p-3">
        <div className="text-sm font-semibold mb-1">Default WIT Hierarki</div>
        <div className="text-xs text-gray-500 mb-3">
          Pull to change the hierachy. Top = parent, under = children.
        </div>

        {selected.length === 0 ? (
          <div className="text-xs text-gray-500">Choose Work item types from the left</div>
        ) : (
          <ul className="flex flex-col gap-2">
            {selected.map((name, idx) => (
              <li
                key={name}
                draggable
                onDragStart={(e) => {
                  dragIndexRef.current = idx;
                  // optional: gør det lidt pænere i nogle browsere
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", name);
                }}
                onDragOver={(e) => {
                  // vigtig: uden preventDefault kan man ikke droppe
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const from = dragIndexRef.current;
                  if (from === null || from === idx) return;
                  onChange(arrayMove(selected, from, idx));
                  dragIndexRef.current = null;
                }}
                onDragEnd={() => {
                  dragIndexRef.current = null;
                }}
                className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2 bg-white"
              >
                <div className="flex items-center gap-2">
                  <span className="cursor-grab select-none text-gray-400">⋮⋮</span>

                  {/* “hierarki-visual”: bare indryk baseret på index */}
                  <span style={{ paddingLeft: Math.min(idx * 10, 40) }} className="text-sm">
                    {idx === 0 ? "🟦 " : "↳ "}
                    {name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => remove(name)}
                  className="text-xs rounded-md border border-gray-200 px-2 py-1 hover:bg-gray-50"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}