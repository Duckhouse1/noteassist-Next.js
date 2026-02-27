"use client";

import Image from "next/image";
import { NavItem } from "@/app/Components/HeaderNavItem";
import { Pages } from "../(app)/[company]/dashboard/dashboardClient";


type HeaderProps = {
  company: string;
  currentPage: Pages;
  setCurrentPage: (page: Pages) => void;
  isPersonalOrg: boolean;
  member?: string; // e.g. "owner"
};



export const Header = ({
  company,
  currentPage,
  setCurrentPage,
  isPersonalOrg,
  member,
}: HeaderProps) => {
  // ActionGallery is part of the note flow, so "Note" tab should stay active
  const isNoteFlow = currentPage === "frontpage" || currentPage === "ActionGallery";

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80">
      {/* <div className="mx-auto w-full max-w-[1550px] px-4 sm:px-6 lg:px-8 border-2"> */}
        <div className="relative flex h-14 items-center px-8">
          {/* Left: logo + brand */}
          <div className="flex items-center gap-3 justify-start justify-self-start">
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
            {/* Nav links */}
          </div>
          <nav className="absolute left-1/2 -translate-x-1/2 flex items-center divide-x divide-slate-400">
            <div className="px-5">
              <NavItem
                label="Note"
                active={isNoteFlow}
                onClick={() => setCurrentPage("frontpage")}
              />
            </div>

            <div className="px-5">
              <NavItem
                label="My Notes"
                active={currentPage === "MyNotes"}
                onClick={() => setCurrentPage("MyNotes")}
              />
            </div>
            <div className="px-5">
              <NavItem
                label="Integrations"
                active={currentPage === "Integrations"}
                onClick={() => setCurrentPage("Integrations")}
              />
            </div>
            {member === "owner" && (
              <div className="px-5">
                <NavItem
                  label="Organization"
                  active={currentPage === "Organisations"}
                  onClick={() => setCurrentPage("Organisations")}
                />
              </div>
            )}
          </nav>
          {/* Right: settings + avatar */}
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentPage("configurations")}
              className={[
                "cursor-pointer  inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all focus:outline-none",
                currentPage === "configurations"
                  ? "border-black bg-black text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 hover:bg-gray-50",
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
      {/* </div> */}
    </header>
  );
};