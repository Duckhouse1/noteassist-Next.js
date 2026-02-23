"use client";

import Link from "next/link";
import { useState } from "react";
import { navItems } from "./content";
import { buttonStyles } from "../ui/buttonStyles";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-sm"
        aria-label="Open menu"
      >
        <span className="text-lg leading-none">≡</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg">
          <div className="p-3">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className={buttonStyles({ variant: "secondary", className: "flex-1" })}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className={buttonStyles({ variant: "primary", className: "flex-1" })}
              >
                Start
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}