import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOutlookAccessToken } from "@/lib/Integrations/Outlook/getOutlookAccessToken";

type Body = {
    recipients: string[];
    contentHtml: string;
    subject?: string;
};

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    try {
        return JSON.stringify(err);
    } catch {
        return "Unknown error";
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;
        const orgId = (session as unknown as { activeOrgID?: string })?.activeOrgID;

        if (!userId || !orgId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = (await req.json()) as Body;

        const recipients = Array.isArray(body.recipients) ? body.recipients : [];
        const contentHtml = typeof body.contentHtml === "string" ? body.contentHtml : "";
        const subject =
            typeof body.subject === "string" && body.subject.trim()
                ? body.subject.trim()
                : "Message from Norbit";

        if (!recipients.length) {
            return NextResponse.json({ error: "No recipients provided" }, { status: 400 });
        }
        if (!contentHtml.trim()) {
            return NextResponse.json({ error: "No content provided" }, { status: 400 });
        }

        const invalid = recipients.filter((e) => !isValidEmail(e));
        if (invalid.length) {
            return NextResponse.json(
                { error: `Invalid emails: ${invalid.join(", ")}` },
                { status: 400 }
            );
        }

        const accessToken = await getOutlookAccessToken(userId, orgId);
        if (!accessToken) {
            return NextResponse.json(
                { error: "Outlook is not connected. Please connect your Outlook account first." },
                { status: 401 }
            );
        }

        const graphRes = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: {
                    subject,
                    body: {
                        contentType: "HTML",
                        content: contentHtml,
                    },
                    toRecipients: recipients.map((address) => ({
                        emailAddress: { address },
                    })),
                },
                saveToSentItems: true,
            }),
        });

        if (!graphRes.ok) {
            const errText = await graphRes.text().catch(() => "");
            return NextResponse.json(
                { error: "Graph sendMail failed", details: errText },
                { status: 502 }
            );
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
    }
}