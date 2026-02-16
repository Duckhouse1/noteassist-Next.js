const typePillClass = (type: "Feature" | "PBI" | "Task") => {
  switch (type) {
    case "Feature":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "PBI":
      return "bg-violet-50 text-violet-700 border-violet-200";
    case "Task":
      return "bg-sky-50 text-sky-700 border-sky-200";
  }
};

export function TypePill({ type }: { type: "Feature" | "PBI" | "Task" }) {
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
