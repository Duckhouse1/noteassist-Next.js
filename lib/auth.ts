import type { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * Ensure the user has at least one organization.
 * If not, create a personal org and membership.
 */
async function ensurePersonalOrg(userId: string) {
  const existing = await prisma.membership.findFirst({
    where: { userId },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });

  if (existing) return existing.organization;

  const org = await prisma.organization.create({
    data: {
      name: "MyWorkSpace",
      slug: `user-${userId}`,
      members: {
        create: {
          userId,
          role: "owner",
        },
      },
    },
  });

  return org;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, name: true, passwordHash: true },
        });

        if (!user?.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // must return id
        return { id: user.id, email: user.email, name: user.name };
      },
    }),

    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope:
            "openid profile email offline_access User.Read Mail.ReadWrite Calendars.ReadWrite",
        },
      },
    }),
  ],

  // EVENTS: good for side-effects, but don't rely on it to always run
  events: {
    async signIn({ user }) {
      if (!user?.id) return;
      await ensurePersonalOrg(user.id);
    },
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // ✅ Make sure token.sub is set on first login (especially credentials)
      if (user?.id) {
        token.sub = user.id;
      }

      // Only do org lookup when we have a user id
      if (token.sub) {
        /**
         * ✅ Avoid DB work on every request:
         * Only ensure org when:
         * - first login (user exists)
         * - or we don't already have activeOrg on token
         */
        if (user?.id || !token.activeOrgId) {
          const org = await ensurePersonalOrg(token.sub);
          token.activeOrgId = org.id;
          token.activeOrgSlug = org.slug;
        }

        // Store OAuth tokens only when account exists (sign-in / refresh)
        if (account) {
          token.accessToken = account.access_token;
          token.expiresAt = account.expires_at;

          if (account.provider === "azure-ad" && account.refresh_token) {
            await prisma.integrationConnection.upsert({
              where: {
                organizationId_userId_provider: {
                  organizationId: token.activeOrgId as string,
                  userId: token.sub,
                  provider: "microsoft",
                },
              },
              update: {
                accessToken: account.access_token,
                refreshToken: account.refresh_token,
                expiresAt: account.expires_at
                  ? new Date(account.expires_at * 1000)
                  : null,
                scope: account.scope,
              },
              create: {
                organizationId: token.activeOrgId as string,
                userId: token.sub,
                provider: "microsoft",
                displayName: "Microsoft",
                accessToken: account.access_token,
                refreshToken: account.refresh_token,
                expiresAt: account.expires_at
                  ? new Date(account.expires_at * 1000)
                  : null,
                scope: account.scope,
                meta: null,
              },
            });
          }
        }
      }

      return token;
    },

    async session({ session, token }) {
      // ✅ Put user id into the session (this fixes your undefined issue)
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      if(token.activeOrgId){
        session.activeOrgID = token.activeOrgId
      }

      // ✅ Expose access token
      // (session).accessToken = token.accessToken as string | undefined;

      return session;
    },
  },
};
