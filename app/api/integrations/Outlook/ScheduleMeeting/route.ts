import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOutlookAccessToken } from "@/lib/Integrations/Outlook/getOutlookAccessToken";
import { OutlookMeeting } from "@/app/types/OpenAI";

function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    try { return JSON.stringify(err); } catch { return "Unknown error"; }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;
        const orgId = (session as unknown as { activeOrgID?: string })?.activeOrgID;

        if (!userId || !orgId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = (await req.json()) as OutlookMeeting;

        if (!body.title?.trim()) {
            return NextResponse.json({ error: "Meeting title is required" }, { status: 400 });
        }
        if (!body.startDateTime || !body.endDateTime) {
            return NextResponse.json({ error: "Start and end date/time are required" }, { status: 400 });
        }

        const accessToken = await getOutlookAccessToken(userId, orgId);
        if (!accessToken) {
            return NextResponse.json(
                { error: "Outlook is not connected. Please connect your Outlook account first." },
                { status: 401 }
            );
        }

        const eventBody: Record<string, unknown> = {
            subject: body.title,
            body: {
                contentType: "HTML",
                content: body.description || "",
            },
            start: {
                dateTime: body.startDateTime,
                timeZone: "UTC",
            },
            end: {
                dateTime: body.endDateTime,
                timeZone: "UTC",
            },
            attendees: (body.attendees ?? []).map((email) => ({
                emailAddress: { address: email },
                type: "required",
            })),
            isOnlineMeeting: body.isOnlineMeeting ?? false,
        };

        if (body.location?.trim()) {
            eventBody.location = { displayName: body.location };
        }

        // Do NOT set onlineMeetingProvider explicitly —
        // Graph auto-selects "teamsForBusiness" when isOnlineMeeting=true
        // and the tenant has Teams. Hardcoding it can break non-Teams tenants.

        const graphHeaders: Record<string, string> = {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        };

        const graphRes = await fetch("https://graph.microsoft.com/v1.0/me/events", {
            method: "POST",
            headers: graphHeaders,
            body: JSON.stringify(eventBody),
        });

        if (!graphRes.ok) {
            const errText = await graphRes.text().catch(() => "");
            return NextResponse.json(
                { error: "Graph create event failed", details: errText },
                { status: 502 }
            );
        }

        const created = await graphRes.json();

        // The create response doesn't always populate onlineMeeting.joinUrl immediately.
        // Do a GET on the created event to retrieve the fully-resolved object.
        let joinUrl: string | null = created.onlineMeeting?.joinUrl ?? null;

        if (body.isOnlineMeeting && !joinUrl && created.id) {
            const getRes = await fetch(
                `https://graph.microsoft.com/v1.0/me/events/${created.id}?$select=onlineMeeting,webLink`,
                { headers: graphHeaders }
            );
            if (getRes.ok) {
                const full = await getRes.json();
                joinUrl = full.onlineMeeting?.joinUrl ?? null;
            }
        }

        return NextResponse.json({
            ok: true,
            eventId: created.id,
            webLink: created.webLink,
            onlineMeetingUrl: joinUrl,
        });
    } catch (err) {
        return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
    }
}