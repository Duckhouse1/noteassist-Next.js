import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
    activeOrgID: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
    activeOrgId?: string;
    activeOrgSlug?: string;
  }
}

