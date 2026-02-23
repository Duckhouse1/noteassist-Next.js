"use client";

import Image from "next/image";
import { Pages } from "../dashboardClient";


type HeaderProps = {
  company: string;
  currentPage: Pages;
  setCurrentPage: (page: Pages) => void;
  isPersonalOrg: boolean;
  member?: string; // e.g. "owner"
};

type NavItemProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

const NavItem = ({ label, active, onClick }: NavItemProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "text-sm font-medium transition-colors",
        active ? "text-slate-900" : "text-slate-500 hover:text-slate-900",
      ].join(" ")}
    >
      {label}
    </button>
  );
};

export const Header = ({
  company,
  currentPage,
  setCurrentPage,
  isPersonalOrg,
  member,
}: HeaderProps) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80">
      <div className="w-full 2xl:max-w-[1550px] px-4 sm:px-6 lg:px-8 ml-4">
        <div className="flex h-14 justify-between">
          {/* Left: logo + brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentPage("frontpage")}
              className="flex items-center gap-1 focus:outline-none cursor-pointer"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-lg">
                <Image
                  src="/NorbitLogo.png"
                  alt="ActionNotes"
                  width={100}
                  height={100}
                />
              </div>
              <div className="leading-none">
                {!isPersonalOrg && (
                  <p className="text-[10px] text-slate-400 font-medium">
                    {company}
                  </p>
                )}
              </div>
            </button>

            {/* Divider */}
            <div className="ml-3 h-5 w-px bg-slate-200" />

            {/* Nav links */}
            <nav className="flex items-center gap-5 ml-2">
              <NavItem
                label="Note"
                active={currentPage === "frontpage"}
                onClick={() => setCurrentPage("frontpage")}
              />
              <NavItem
                label="My Notes"
                active={currentPage === "MyNotes"}
                onClick={() => setCurrentPage("MyNotes")}
              />
              {member === "owner" && (
                <NavItem
                  label="Organisation"
                  active={currentPage === "Organisations"}
                  onClick={() => setCurrentPage("Organisations")}
                />
              )}
            </nav>
          </div>

          {/* Right: settings + avatar */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentPage("configurations")}
              className={[
                "cursor-pointer inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all focus:outline-none",
                currentPage === "configurations"
                  ? "border-[#1E3A5F] bg-[#1E3A5F] text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900",
              ].join(" ")}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Configuration
            </button>

            {/* Avatar */}
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 ring-2 ring-white" />
          </div>
        </div>
      </div>
    </header>
  );
};