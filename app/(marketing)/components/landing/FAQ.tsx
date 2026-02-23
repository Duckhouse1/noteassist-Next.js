import Container from "../ui/Container";
import { faqs } from "./content";

export default function FAQ() {
  return (
    <section id="faq" className="bg-zinc-50/40 py-14">
      <Container>
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            FAQ
          </h2>
          <p className="mt-3 text-zinc-600">
            The common questions teams ask before rolling it out.
          </p>
        </div>

        <div className="mt-10 grid gap-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold">
                <div className="flex items-center justify-between">
                  <span>{f.q}</span>
                  <span className="ml-4 text-zinc-400 group-open:rotate-45 transition-transform">
                    +
                  </span>
                </div>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">{f.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}