import Container from "../ui/Container";
import Link from "next/link";
import { buttonStyles } from "../ui/buttonStyles";
import Badge from "../ui/Badge";


function FakePreview() {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
        </div>
        <span className="text-xs text-zinc-500">Preview</span>
      </div>

      <div className="grid gap-0 md:grid-cols-2">
        <div className="border-b border-zinc-100 p-5 md:border-b-0 md:border-r">
          <div className="text-xs font-medium text-zinc-500">Meeting notes</div>
          <div className="mt-3 space-y-2 text-sm">
            <div className="rounded-xl bg-zinc-50 p-3">
              <div className="font-medium">Sprint planning</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-700">
                <li>Bug backlog: prioritize login timeout issue</li>
                <li>New feature: “Action templates” for teams</li>
                <li>Decide owner for SharePoint upload flow</li>
              </ul>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3 text-zinc-700">
              Decisions: ship hotfix today • demo Friday 14:00
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs font-medium text-zinc-500">Selected actions</div>

          <div className="mt-3 space-y-2">
            <div className="rounded-2xl border border-zinc-200 p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Create Azure DevOps work items</div>
                <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-700">
                  JSON
                </span>
              </div>
              <pre className="mt-2 overflow-auto rounded-xl bg-zinc-950 p-3 text-[11px] leading-relaxed text-zinc-100">
{`{
  "title": "Fix login timeout issue",
  "type": "Bug",
  "assignedTo": "team@org.com",
  "acceptanceCriteria": [
    "Session refresh works",
    "No forced re-login"
  ]
}`}
              </pre>
            </div>

            <div className="rounded-2xl border border-zinc-200 p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Draft Outlook email</div>
                <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-700">
                  Preview
                </span>
              </div>
              <div className="mt-2 rounded-xl bg-zinc-50 p-3 text-sm text-zinc-700">
                Subject: Sprint planning follow-up<br />
                Body: Here are the key decisions & next steps…
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <div className={buttonStyles({ variant: "secondary", className: "flex-1 h-10" })}>
              Edit preview
            </div>
            <div className={buttonStyles({ variant: "primary", className: "flex-1 h-10" })}>
              Create actions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(0,0,0,0.06),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(0,0,0,0.05),transparent_35%)]" />

      <Container>
        <div className="relative grid gap-10 py-14 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-6">
            <div className="flex items-center gap-3">
              <Badge>Notes → Actions</Badge>
              <span className="text-xs text-zinc-500">
                Built on Azure OpenAI • OAuth integrations
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
              Turn meeting notes into real work — without copy-pasting.
            </h1>

            <p className="mt-4 text-base leading-relaxed text-zinc-600 sm:text-lg">
              Log in, write notes, select actions (DevOps items, Outlook drafts,
              SharePoint uploads, meetings, and more). Get AI-generated structured
              JSON, preview/edit everything, then execute.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className={buttonStyles({ variant: "primary", size: "lg" })}>
                Get started free
              </Link>
              <a
                href="#workflow"
                className={buttonStyles({ variant: "secondary", size: "lg" })}
              >
                See the workflow
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-xs text-zinc-500">
              <span className="rounded-full border border-zinc-200 px-3 py-1">
                Organizations
              </span>
              <span className="rounded-full border border-zinc-200 px-3 py-1">
                Encrypted storage
              </span>
              <span className="rounded-full border border-zinc-200 px-3 py-1">
                Preview before create
              </span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <FakePreview />
          </div>
        </div>
      </Container>
    </section>
  );
}