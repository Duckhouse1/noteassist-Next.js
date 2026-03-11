import { prisma } from "@/lib/prisma";
import { decrypt } from "../../cryptation";
import { refreshJiraAccessToken } from "./refreshtoken";
import { ProviderId } from "../ProviderUserConfigs";

export async function getJiraAccessToken(userId: string, organizationId: string) {
    const conn = await prisma.integrationConnection.findUnique({
        where: {
            organizationId_userId_provider: {
                organizationId,
                userId,
                provider: "jira" as ProviderId,
            },
        },
        select: {
            accessToken: true,
            refreshToken: true,
            expiresAt: true,
            id: true,
        },
    })
    if (!conn?.accessToken) return null;
    const accessToken = decrypt(conn.accessToken);

    const expiresAt = conn.expiresAt?.getTime() ?? 0;
    const isExpired = expiresAt && Date.now() > expiresAt - 60_000;

    if (!isExpired) return accessToken;
    console.log("jira token is expired, trying to fetch new one");
    const newAccessToken = await refreshJiraAccessToken(conn);
    return newAccessToken;
}