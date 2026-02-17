"use client";

type ToastType = "success" | "error" | "info";

export function Toast({
  message,
  type = "info",
  onClose,
}: {
  message: string;
  type?: ToastType;
  onClose?: () => void;
}) {
  if (!message) return null;

  const styles =
    type === "success"
      ? "bg-green-500/90 border-green-400/40"
      : type === "error"
      ? "bg-red-500/90 border-red-400/40"
      : "bg-slate-900/90 border-slate-700/40";

  const icon = type === "success" ? "✓" : type === "error" ? "!" : "i";

  return (
    // ✅ Wrapper does centering only (stable)
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      {/* ✅ Child does animation only (no transform conflicts) */}
      <div className="animate-slide-down">
        <div
          className={`rounded-xl ${styles} backdrop-blur-md px-6 py-3 text-white shadow-xl border`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <span className="font-medium">{message}</span>

            {onClose && (
              <button
                onClick={onClose}
                className="ml-3 rounded-lg px-2 py-1 text-white/90 hover:text-white hover:bg-white/10 transition"
                aria-label="Close message"
                type="button"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
