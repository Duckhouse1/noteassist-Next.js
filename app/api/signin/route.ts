import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL));
  }

  const userId = session.user.id;

  const memberships = await prisma.membership.findMany({
    where: { userId },
    select: { organization: { select: { slug: true } } },
    orderBy: { createdAt: "asc" },
  });

  // if (memberships.length === 0) {
  //   return NextResponse.redirect(new URL("/onboarding/create-org", process.env.NEXTAUTH_URL));
  // }

  if (memberships.length === 1) {
    const slug = memberships[0]!.organization.slug;
    return NextResponse.redirect(new URL(`/${slug}/dashboard`, process.env.NEXTAUTH_URL));
  }

  return NextResponse.redirect(new URL("/choose-org", process.env.NEXTAUTH_URL));
}
