import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !(session.user).id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connections = await prisma.integrationConnection.findMany({
        where: { userId: session.user.id },
        select: { displayName: true, provider: true, id: true },
    });

    return NextResponse.json(connections);
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !(session.user).id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { provider } = (await req.json()) as { provider?: string };

    if (!provider) {
        return NextResponse.json({ error: "Missing provider" }, { status: 400 });
    }

    const userId = session.user.id as string;
    const organizationId = session.activeOrgID as string;

    if (!organizationId) {
        return NextResponse.json({ error: "No active organization" }, { status: 400 });
    }

    await prisma.integrationConnection.delete({
        where: {
            organizationId_userId_provider: {
                organizationId,
                userId,
                provider,
            },
        },
    });

    return NextResponse.json({ ok: true });
}