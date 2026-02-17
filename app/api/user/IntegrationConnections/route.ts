import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";


export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !(session.user).id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connections = await prisma.integrationConnection.findMany({
        where: {userId: session.user.id},
        select: {displayName:true, provider:true}
    })

    return NextResponse.json(connections)
}