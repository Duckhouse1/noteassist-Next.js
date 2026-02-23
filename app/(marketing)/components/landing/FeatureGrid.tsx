import Container from "../ui/Container";
import { featureCards } from "./content";

export default function FeatureGrid() {
  return (
    <section id="features" className="py-14">
      <Container>
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Everything you need to go from “we talked about it” to “it’s created”.
          </h2>
          <p className="mt-3 text-zinc-600">
            A clean writing experience, structured action generation, and an explicit review step —
            so your org can trust the output.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featureCards.map((f) => (
            <div
              key={f.title}
              className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="text-sm font-semibold">{f.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}