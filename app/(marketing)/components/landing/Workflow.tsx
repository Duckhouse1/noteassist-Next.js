import Container from "../ui/Container";

function Step({
  n,
  title,
  desc,
}: {
  n: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-2xl bg-zinc-900 text-sm font-semibold text-white">
          {n}
        </div>
        <div className="text-sm font-semibold">{title}</div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600">{desc}</p>
    </div>
  );
}

export default function Workflow() {
  return (
    <section id="workflow" className="bg-zinc-50/40 py-14">
      <Container>
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            A workflow teams actually follow.
          </h2>
          <p className="mt-3 text-zinc-600">
            Keep it simple: write, choose, preview, execute.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          <Step
            n="1"
            title="Write notes"
            desc="Capture meeting notes in a clean editor. Tag owners, deadlines, and decisions naturally."
          />
          <Step
            n="2"
            title="Select actions"
            desc="Pick actions like DevOps work items, SharePoint uploads, Outlook drafts, and meetings."
          />
          <Step
            n="3"
            title="Preview & edit"
            desc="Azure OpenAI generates structured JSON per action. Review and edit before you create anything."
          />
        </div>

        <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold">Example action mapping</div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-zinc-50 p-4">
              <div className="text-xs font-medium text-zinc-500">Input</div>
              <div className="mt-2 text-sm text-zinc-700">
                “Assign owner to SharePoint upload. Hotfix login timeout today.”
              </div>
            </div>
            <div className="rounded-2xl bg-zinc-50 p-4">
              <div className="text-xs font-medium text-zinc-500">Selected actions</div>
              <ul className="mt-2 list-disc pl-5 text-sm text-zinc-700">
                <li>SharePoint: upload cleaned notes</li>
                <li>Azure DevOps: create bug</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-zinc-950 p-4">
              <div className="text-xs font-medium text-zinc-300">Generated JSON</div>
              <pre className="mt-2 overflow-auto text-[11px] leading-relaxed text-zinc-100">{`{
  "devops": { "type": "Bug", "title": "Fix login timeout" },
  "sharepoint": { "folder": "Meetings/Sprint", "file": "notes.md" }
}`}</pre>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}