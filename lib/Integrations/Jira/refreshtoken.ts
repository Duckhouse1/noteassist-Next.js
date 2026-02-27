import { decrypt, encrypt } from "../../cryptation";
import { prisma } from "../../prisma";
import { IntegrationConnection } from "@prisma/client";

export async function refreshJiraAccessToken(conn: Partial<IntegrationConnection>) {
    if (!conn?.refreshToken) return null;

    const refreshToken = decrypt(conn.refreshToken);

    try {
        const response = await fetch("https://auth.atlassian.com/oauth/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                grant_type: "refresh_token",
                client_id: process.env.JIRA_CLIENT_ID!,
                client_secret: process.env.JIRA_CLIENT_SECRET!,
                refresh_token: refreshToken,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Jira token refresh failed:", errorText);
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
        console.error("Jira token refresh error:", err);
        return null;
    }
}