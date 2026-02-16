import React, { useMemo, useRef, useState } from "react";
import { DevOpsArea } from "./DevOpsPreBody";



type DevOpsAreaDropdownProps = {
  disabled?: boolean;
  areas: DevOpsArea[] | DevOpsArea | null; // supports root node OR array OR null
  value?: number; // selected value (identifier or id)
  onChange: (newValue: number, area: DevOpsArea) => void;

  /**
   * Choose what you want to store as the selected value.
   * - "identifier" matches your interface and is usually what you'd send to DevOps
   * - "id" if you prefer the GUID-ish node id
   */
  valueKey?: "identifier" | "id";

  placeholder?: string;
};

export function DevOpsAreaDropdown({
  disabled,
  areas,
  value,
  onChange,
  valueKey = "identifier",
  placeholder = "Select area",
}: DevOpsAreaDropdownProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const roots: DevOpsArea[] = useMemo(() => {
    if (!areas) return [];
    return Array.isArray(areas) ? areas : [areas];
  }, [areas]);

  const flatByValue = useMemo(() => {
    const map = new Map<number, DevOpsArea>();
    const walk = (node: DevOpsArea) => {
      map.set(node[valueKey] as number, node);
      node.children?.forEach(walk);
    };
    roots.forEach(walk);
    return map;
  }, [roots, valueKey]);

  const selectedArea = value ? flatByValue.get(value) : undefined;

  const toggleExpanded = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Close on outside click
  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const Row = ({
    area,
    depth,
  }: {
    area: DevOpsArea;
    depth: number;
  }) => {
    const isExpanded = expanded.has(area.id);
    const canExpand = area.hasChildren && (area.children?.length ?? 0) > 0;

    return (
      <div>
        <div
          className={[
            "flex items-center gap-1 rounded-md px-2 py-1.5 text-sm",
            "hover:bg-slate-100",
          ].join(" ")}
          style={{ paddingLeft: 8 + depth * 14 }}
        >
          {/* Expand/collapse */}
          <button
            type="button"
            className={[
              "h-6 w-6 grid place-items-center rounded",
              canExpand ? "hover:bg-slate-200 text-slate-700" : "text-transparent cursor-default",
            ].join(" ")}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (canExpand) toggleExpanded(area.id);
            }}
            aria-label={canExpand ? (isExpanded ? "Collapse" : "Expand") : undefined}
            disabled={!canExpand}
          >
            {/* chevron */}
            <svg
              width="14"
              height="14"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={[
                "transition-transform",
                isExpanded ? "rotate-90" : "rotate-0",
                canExpand ? "text-slate-600" : "text-transparent",
              ].join(" ")}
            >
              <path d="M7.25 4.75a.75.75 0 0 1 1.06 0l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06L11.69 10 7.25 5.81a.75.75 0 0 1 0-1.06Z" />
            </svg>
          </button>

          {/* Select */}
          <button
            type="button"
            className="flex-1 text-left truncate text-slate-900"
            onClick={() => {
              const newVal = area[valueKey];
              onChange(newVal as number, area);
              setOpen(false);
            }}
            title={area.name}
          >
            {area.name}
          </button>
        </div>

        {canExpand && isExpanded && (
          <div className="mt-0.5">
            {area.children!.map((c) => (
              <Row key={c.id} area={c} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative" ref={wrapRef}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="
          w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900
          shadow-sm outline-none transition text-left
          focus:border-slate-300 focus:ring-4 focus:ring-blue-100
          disabled:bg-slate-50 disabled:text-slate-500
          flex items-center justify-between gap-2
        "
      >
        <span className={selectedArea ? "truncate" : "truncate text-slate-400"}>
          {selectedArea ? selectedArea.name : placeholder}
        </span>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="text-slate-400">
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Menu */}
      {open && !disabled && (
        <div
          className="
            absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg
            max-h-72 overflow-auto p-2
          "
          role="listbox"
        >
          {roots.length === 0 ? (
            <div className="px-2 py-2 text-sm text-slate-500">No areas available</div>
          ) : (
            roots.map((r) => <Row key={r.id} area={r} depth={0} />)
          )}
        </div>
      )}
    </div>
  );
}
