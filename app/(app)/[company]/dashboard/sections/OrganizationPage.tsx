"use client";

import { useEffect, useState } from "react";

interface Member {
  id: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface OrganisationPageProps {
  company: string;
}

export default function OrganisationPage({ company }: OrganisationPageProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviting, setInviting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    try {
      setLoading(true);
      const res = await fetch(`/api/companies/${encodeURIComponent(company)}/users`);
      if (!res.ok) throw new Error("Failed to fetch members");
      const data = await res.json();
      setMembers(data.members ?? data);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const res = await fetch(`/api/companies/${encodeURIComponent(company)}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      if (!res.ok) throw new Error("Failed to invite");
      setInviteEmail("");
      setToast("Member invited successfully");
      setTimeout(() => setToast(null), 3000);
      fetchMembers();
    } catch (err) {
      console.error("Invite failed:", err);
      setToast("Failed to invite member");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setInviting(false);
    }
  }

  const roleLabel = (role: string) => {
    if (role === "owner") return "Owner";
    if (role === "admin") return "Admin";
    return "Member";
  };

  return (
    <div className="bg-white w-full h-full flex flex-col overflow-auto">
      {/* Page header */}
      <div className="p-10 px-20 pb-0">
        <h1 className="text-4xl font-bold tracking-tighter">Organisation</h1>
        <h2 className="text-gray-400">
          Manage your team and workspace settings
        </h2>
      </div>

      <div className="px-20 pt-8 pb-20">
        <div className="flex items-start gap-10">
          {/* Left: Members list */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400">Members:</h3>
              {!loading && (
                <span className="text-xs font-medium text-slate-400 tabular-nums">
                  {members.length} {members.length === 1 ? "member" : "members"}
                </span>
              )}
            </div>

            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              {loading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-100 animate-pulse" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-32 rounded bg-slate-100 animate-pulse" />
                        <div className="h-2.5 w-48 rounded bg-slate-100 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : members.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-8">
                  <div className="flex items-center gap-1.5 mb-5 opacity-30">
                    <div className="h-1 w-1 rounded-full bg-slate-900" />
                    <div className="h-1 w-6 rounded-full bg-slate-900" />
                    <div className="h-1 w-1 rounded-full bg-slate-900" />
                  </div>
                  <p className="text-[13px] font-medium tracking-tight text-slate-400">
                    No members found
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-slate-50/60">
                      <th className="text-left px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">User</th>
                      <th className="text-left px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.id} className="border-b border-gray-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {(member.user.name ?? member.user.email ?? "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {member.user.name ?? "Unnamed"}
                              </p>
                              <p className="text-xs text-slate-400">
                                {member.user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={[
                            "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                            member.role === "owner"
                              ? "bg-black text-white"
                              : member.role === "admin"
                                ? "bg-slate-200 text-slate-700"
                                : "bg-slate-100 text-slate-500",
                          ].join(" ")}>
                            {roleLabel(member.role)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right: Invite + info */}
          <div className="w-[320px] shrink-0 flex flex-col gap-4">
            {/* Workspace info */}
            <div className="border border-gray-200 rounded-2xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Workspace</p>
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-lg bg-black flex items-center justify-center text-white text-sm font-bold">
                  {company.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{company}</p>
                  <p className="text-xs text-slate-400">Organisation</p>
                </div>
              </div>
            </div>

            {/* Invite member */}
            <div className="border border-gray-200 rounded-2xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Invite member</p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-300 focus:border-slate-400 transition-colors"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 transition-colors bg-white"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail.trim()}
                  className="cursor-pointer w-full rounded-xl bg-black text-sm font-medium text-white px-4 py-2.5 hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {inviting ? "Inviting…" : "Send invite"}
                </button>
              </div>
            </div>

            {/* Toast */}
            {toast && (
              <div className="rounded-xl border border-gray-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600">
                {toast}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}