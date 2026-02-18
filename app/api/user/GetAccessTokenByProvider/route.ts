import { authOptions } from "@/lib/auth";
import { decrypt } from "@/lib/cryptation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const provider = searchParams.get("provider");

  if (!provider) {
    return NextResponse.json({ error: "Missing provider" }, { status: 400 });
  }

  const connection = await prisma.integrationConnection.findFirst({
    where: { provider, userId: session.user.id },
    select: { accessToken: true },
  });

  return NextResponse.json(decrypt(connection!.accessToken!));
}
