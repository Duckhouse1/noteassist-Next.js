import { decrypt, encrypt } from "../../cryptation";
import { prisma } from "../../prisma";
import { IntegrationConnection } from "@prisma/client";

export async function refreshAccessToken(conn: Partial<IntegrationConnection>) {
    if (!conn?.refreshToken) return null;
    // const GraphScope = conn.provider === "SharePoint" as IntegrationOptionsTitle ?
    //     [
    //         "Sites.ReadWrite.All",
    //         "offline_access",
    //         "openid",
    //         "profile",
    //     ]
    //     :
    //     [
    //         "openid",
    //         "profile",
    //         "email",
    //         "offline_access",
    //         "User.Read",
    //         "Mail.ReadWrite",
    //         "Calendars.ReadWrite",
    //     ]
    const refreshToken = decrypt(conn.refreshToken);
    // const scopeString =
    //     conn.provider === "Azure-Devops" as IntegrationOptionsTitle ? "499b84ac-1321-427f-aa17-267ca6975798/.default offline_access" : GraphScope.join(" ")
    const params = new URLSearchParams();
    params.append("client_id", process.env.AZURE_AD_CLIENT_ID!);
    params.append("client_secret", process.env.AZURE_AD_CLIENT_SECRET!);
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", refreshToken);

    try {
        const response = await fetch(
            "https://login.microsoftonline.com/common/oauth2/v2.0/token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: params.toString(),
            }
        );
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Token refresh failed:", errorText);
            return null;
        }
        const data = await response.json();

        const newAccessToken = data.access_token;
        const newRefreshToken = data.refresh_token;
        const expiresIn = data.expires_in; // seconds

        await prisma.integrationConnection.update({
            where: { id: conn.id },
            data: {
                accessToken: encrypt(newAccessToken),
                refreshToken: encrypt(newRefreshToken ?? refreshToken),
                expiresAt: new Date(Date.now() + expiresIn * 1000),
            },
        });

        return newAccessToken;
    } catch (err) {
        console.error("Token refresh error:", err);
        return null;
    }
}
