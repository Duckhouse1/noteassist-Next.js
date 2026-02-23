import Container from "../ui/Container";
import { integrations } from "./content";

export default function Integrations() {
  return (
    <section id="integrations" className="py-14">
      <Container>
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Integrations that feel native.
          </h2>
          <p className="mt-3 text-zinc-600">
            Connect once via OAuth, then generate action payloads you can execute reliably.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((i) => (
            <div
              key={i.name}
              className="flex items-start gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-zinc-200 bg-zinc-50 text-sm font-semibold">
                {i.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-semibold">{i.name}</div>
                <div className="mt-1 text-sm text-zinc-600">{i.note}</div>
                <div className="mt-3 inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700">
                  OAuth supported
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-zinc-200 bg-zinc-50/60 p-6">
          <p className="text-sm text-zinc-700">
            Add connectors over time: the product is designed so each action has its own schema,
            validation, and preview UI — keeping automation predictable as you expand.
          </p>
        </div>
      </Container>
    </section>
  );
}