import { on } from "events";
import { Settings } from "lucide-react";
import { useState } from "react";

export function SettingsHoverMenu( { onConfigurations }: { onConfigurations?: () => void } ) {
    const [showDropDown, setShowDropDown] = useState(false);

  return (
    <div className="relative">
      {/* Use group on a wrapper so hover includes BOTH button + menu */}
      <div className="group inline-flex">
        <button
          type="button"
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
          aria-label="Settings"
          onClick={() => setShowDropDown(!showDropDown)}
        >
          <Settings className="h-5 w-5 text-blue-900 transition group-hover:rotate-90" />
        </button>

        {/* Dropdown */}
        <div
          className="
            invisible absolute right-0 top-full z-50 mt-2 w-56
            translate-y-1 opacity-0
            rounded-2xl border border-slate-200 bg-white shadow-lg
            transition duration-150
            group-hover:visible group-hover:translate-y-0 group-hover:opacity-100
          "
            onMouseLeave={() => setShowDropDown(false)}
            style={{ visibility: showDropDown ? "visible" : "hidden", opacity: showDropDown ? 1 : 0, transform: showDropDown ? "translateY(0)" : "translateY(4px)" }}
        >
          <div className="p-2">
            <button
              type="button"
              onClick={onConfigurations}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Configuration
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Profile
            </button>

            <div className="my-1 h-px bg-slate-200" />

            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
