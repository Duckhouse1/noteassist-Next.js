import { decrypt, encrypt } from "../../cryptation";
import { prisma } from "../../prisma";
import { IntegrationConnection } from "@prisma/client";

export async function refreshOutlookAccessToken(conn: Partial<IntegrationConnection>) {
    if (!conn?.refreshToken) return null;

    const refreshToken = decrypt(conn.refreshToken);

    const params = new URLSearchParams();
    params.append("client_id", process.env.AZURE_AD_CLIENT_ID!);
    params.append("client_secret", process.env.AZURE_AD_CLIENT_SECRET!);
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", refreshToken);
    params.append(
        "scope",
        [
            "openid",
            "profile",
            "email",
            "offline_access",
            "User.Read",
            "Mail.Send",
            "Mail.ReadWrite",
            "Calendars.ReadWrite",
            "OnlineMeetings.ReadWrite",
        ].join(" ")
    );

    try {
        const response = await fetch(
            `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`,
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: params.toString(),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Outlook token refresh failed:", errorText);
            return null;
        }

        const data = await response.json();

        const newAccessToken = data.access_token;
        const newRefreshToken = data.refresh_token;
        const expiresIn = data.expires_in;

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
        console.error("Outlook token refresh error:", err);
        return null;
    }
}