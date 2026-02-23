import Link from "next/link";
import Container from "../ui/Container";
import { pricing } from "./content";
import { buttonStyles } from "../ui/buttonStyles";

export default function Pricing() {
  return (
    <section id="pricing" className="py-14">
      <Container>
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Simple pricing that scales with your org.
          </h2>
          <p className="mt-3 text-zinc-600">
            Start free. Upgrade when you roll it out across teams and connectors.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {pricing.map((p) => (
            <div
              key={p.name}
              className={[
                "rounded-3xl border bg-white p-7 shadow-sm",
                p.featured ? "border-zinc-900" : "border-zinc-200",
              ].join(" ")}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold">{p.name}</div>
                  <div className="mt-1 text-sm text-zinc-600">{p.tagline}</div>
                </div>
                {p.featured && (
                  <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white">
                    Most popular
                  </span>
                )}
              </div>

              <div className="mt-6 flex items-end gap-2">
                <div className="text-3xl font-semibold">{p.price}</div>
                {p.price === "$12" && (
                  <div className="pb-1 text-sm text-zinc-600">/ user</div>
                )}
              </div>

              <ul className="mt-6 space-y-2 text-sm text-zinc-700">
                {p.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="mt-0.5 text-zinc-500">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7">
                <Link
                  href={p.href}
                  className={buttonStyles({
                    variant: p.featured ? "primary" : "secondary",
                    size: "lg",
                    className: "w-full",
                  })}
                >
                  {p.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-zinc-500">
          Pricing is placeholder — wire it to your real plans when ready.
        </p>
      </Container>
    </section>
  );
}