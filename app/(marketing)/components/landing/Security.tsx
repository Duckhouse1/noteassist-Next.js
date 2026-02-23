import Container from "../ui/Container";

export default function Security() {
  return (
    <section id="security" className="bg-zinc-50/40 py-14">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Designed for trust from day one.
            </h2>
            <p className="mt-3 text-zinc-600">
              The whole point is to help teams execute faster — without making security teams nervous.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold">OAuth + least privilege</div>
                <p className="mt-2 text-sm text-zinc-600">
                  Connect platforms using scoped permissions. Keep integrations separated by action type.
                </p>
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold">Encrypted storage</div>
                <p className="mt-2 text-sm text-zinc-600">
                  User data and tokens are stored encrypted, with transport security for all calls.
                </p>
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:col-span-2">
                <div className="text-sm font-semibold">Human-in-the-loop by default</div>
                <p className="mt-2 text-sm text-zinc-600">
                  AI output is previewed and editable before creating work items, emails, meetings, or uploads.
                  This reduces accidental or low-quality automation.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold">Azure-first architecture</div>
              <p className="mt-2 text-sm text-zinc-600">
                Storage in Azure SQL (MSSQL) and generation via Azure OpenAI — built to fit enterprise environments.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}