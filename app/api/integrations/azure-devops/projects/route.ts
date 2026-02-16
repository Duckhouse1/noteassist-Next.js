import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
//   const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
//   const userId = session?.sub as string | undefined;
//   const organizationId = session?.activeOrgId as string | undefined;

//   if (!userId || !organizationId) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const conn = await prisma.integrationConnection.findUnique({
//     where: {
//       organizationId_userId_provider: {
//         organizationId,
//         userId,
//         provider: "azure-devops", // make sure this matches what you store
//       },
//     },
//   });

//   if (!conn?.accessToken) {
//     return NextResponse.json({ error: "Azure DevOps not connected" }, { status: 400 });
//   }
    const pat = process.env.NEXT_PUBLIC_AZURE_DEVOPS_PAT!
  const resp = await fetch(
    "https://dev.azure.com/noteTester/_apis/projects?api-version=7.2-preview.1",
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${pat}`, // ✅ use Bearer token
      },
    }
  );
  console.log(resp);
  const data = await resp.json();
  if (!resp.ok) {
    return NextResponse.json({ error: data }, { status: resp.status });
  }

  return NextResponse.json(data);
}
