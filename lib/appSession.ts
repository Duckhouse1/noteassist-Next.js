import { cookies } from "next/headers";

export type AppSession = {
  company: string;
  email: string;
};

export async function getAppSession(): Promise<AppSession | null> {
  const cookieStore = await cookies(); // ✅ satisfies TS even if typed as Promise
  const raw = cookieStore.get("NoteAssistSession")?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<AppSession>;
    if (typeof parsed.company !== "string" || typeof parsed.email !== "string") return null;
    return { company: parsed.company, email: parsed.email };
  } catch {
    return null;
  }
}
