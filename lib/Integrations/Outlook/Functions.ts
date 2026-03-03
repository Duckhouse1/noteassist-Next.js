// app/Integration/Outlook/SendEmail/route.ts



export async function sendEmail(
  recipients: string[],
  contentHtml: string,
  subject = "Message from my app"
) {
  const res = await fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipients, contentHtml, subject }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error ?? `Failed to send email (${res.status})`);
  }

  return data; // { ok: true } for example
}