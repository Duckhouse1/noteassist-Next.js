import { DevOpsTaskTypes } from "./TaskDisplayPanel";


const TYPE_COLOR_MAP: Record<string, string> = {
  // Core Azure types
  Epic: "bg-rose-50 text-rose-700 border-rose-200",
  Feature: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PBI: "bg-violet-50 text-violet-700 border-violet-200",
  Task: "bg-sky-50 text-sky-700 border-sky-200",
  Bug: "bg-amber-50 text-amber-700 border-amber-200",

  // Common extras
  Story: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Spike: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  Improvement: "bg-teal-50 text-teal-700 border-teal-200",
  Research: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Hotfix: "bg-orange-50 text-orange-700 border-orange-200",
};
const DEFAULT_TYPE_STYLE =
  "bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 border-slate-300";
export const typePillClass = (type: string): string => {
  if (!type) return DEFAULT_TYPE_STYLE;

  const normalized = type.trim();

  return TYPE_COLOR_MAP[normalized] ?? DEFAULT_TYPE_STYLE;
};
export function TypePill({ type }: { type: string }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5",
        "text-[11px] font-semibold tracking-wide",
        typePillClass(type),
      ].join(" ")}
    >
      {/* dot */}
      <span
        className="h-1.5 w-1.5 rounded-full bg-current opacity-70"
        aria-hidden
      />

      {type}
    </span>
  );
}
