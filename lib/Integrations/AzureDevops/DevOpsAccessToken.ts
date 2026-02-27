import { prisma } from "@/lib/prisma";
import { decrypt } from "../../cryptation";
import { refreshAccessToken } from "./RefreshAccessToken";
import { IntegrationOptionsTitle, ProviderId } from "../Types";

export async function getAzureDevOpsAccessToken(userId: string, organizationId: string) {
  const conn = await prisma.integrationConnection.findUnique({
    where: {
      organizationId_userId_provider: {
        organizationId,
        userId,
        provider: "azure-devops" as ProviderId,
      },
    },
    select: {
      accessToken: true,
      refreshToken: true,
      expiresAt: true,
      id:true
    },
  });

  if (!conn?.accessToken) return null;

  const accessToken = decrypt(conn.accessToken);

  const expiresAt = conn.expiresAt?.getTime() ?? 0;
  const isExpired = expiresAt && Date.now() > expiresAt - 60_000; 

  if (!isExpired) return accessToken;
  console.log("Henter en ny accesstoken");
  
  const newAccessToken = await refreshAccessToken(conn)
  console.log("den nye token er hentet: " + newAccessToken);

  return newAccessToken; 
}
