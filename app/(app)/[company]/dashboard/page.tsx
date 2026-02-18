import { redirect } from "next/navigation";
import DashboardClient from "./dashboardClient";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ company: string }>;
};

export default async function DashboardPage({ params }: PageProps) {
  const { company } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) redirect("/login");

  // Load org by slug
  const org = await prisma.organization.findUnique({
    where: { slug: company },
    select: { id: true, slug:true},
  });
  if (!org) notFound();

  // Check membership
  const membership = await prisma.membership.findUnique({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: user.id,
      },
    },
    select: { id: true, role: true },
  });

  if (!membership) redirect("/dashboard"); // user not allowed in this org

  return <DashboardClient company={company} mode={org.slug.startsWith("user-") ? "personal" : "company"} memberShip={membership.role} />;
}
