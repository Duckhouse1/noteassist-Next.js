

import { prisma } from "@/lib/prisma";
import { decrypt } from "../../cryptation";
import { ProviderId } from "../ProviderUserConfigs";

export async function getClickUpAccessToken(userId: string, organizationId: string) {
  const conn = await prisma.integrationConnection.findUnique({
    where: {
      organizationId_userId_provider: {
        organizationId,
        userId,
        provider: "clickup" as ProviderId,
      },
    },
    select: {
      accessToken: true,
    //   refreshToken: true,
    //   expiresAt: true,
      id:true
    },
  });

  if (!conn?.accessToken) return null;

  const accessToken = decrypt(conn.accessToken);

  return accessToken; 
}
