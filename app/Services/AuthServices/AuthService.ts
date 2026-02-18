import { IntegrationConnection } from "@/app/(app)/[company]/dashboard/dashboardClient";

async function GetAccessToken(connection: IntegrationConnection) {
  try {
    const response = await fetch(`/api/user/GetAccessTokenByProvider?provider=${encodeURIComponent(connection.provider)}`,
      { method: "GET" }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`GetAccessToken failed: ${response.status} ${text}`);
    }

    const data = await response.json(); // <-- await this
    console.log("access token response:", data);
    return data;
  } catch (error) {
    console.log("Error fetching AccessToken:", error);
    return null;
  }
}

export const AuthService = {
  GetAccessToken,
};
