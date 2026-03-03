import { prisma } from "@/lib/prisma";
import { decrypt } from "../../cryptation";
import { refreshOutlookAccessToken } from "./refreshOutlookAccessToken";
import { ProviderId } from "../ProviderUserConfigs";

export async function getOutlookAccessToken(userId: string, organizationId: string) {
    const conn = await prisma.integrationConnection.findUnique({
        where: {
            organizationId_userId_provider: {
                organizationId,
                userId,
                provider: "outlook" as ProviderId,
            },
        },
        select: {
            accessToken: true,
            refreshToken: true,
            expiresAt: true,
            id: true,
        },
    });

    if (!conn?.accessToken) return null;

    const accessToken = decrypt(conn.accessToken);

    const expiresAt = conn.expiresAt?.getTime() ?? 0;
    const isExpired = expiresAt && Date.now() > expiresAt - 60_000;

    if (!isExpired) return accessToken;

    console.log("Outlook token expired, refreshing...");
    const newAccessToken = await refreshOutlookAccessToken(conn);
    console.log("New Outlook access token fetched:", !!newAccessToken);

    return newAccessToken;
}