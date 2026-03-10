import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TeamsClient from "./teamsClient";
import TeamsLogin from "./TeamsLogin";

export default async function TeamsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return <TeamsLogin />;
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
    });
    if (!user) return <TeamsLogin />;

    const membership = await prisma.membership.findFirst({
        where: { userId: user.id },
        include: { organization: true },
        orderBy: { createdAt: "asc" },
    });

    if (!membership) return <TeamsLogin />;

    const company = membership.organization.slug;
    const mode = company.startsWith("user-") ? "personal" : "company";
    const memberRole = membership.role;

    return (
        <TeamsClient
            company={company}
            mode={mode as "personal" | "company"}
            memberShip={memberRole}
        />
    );
}