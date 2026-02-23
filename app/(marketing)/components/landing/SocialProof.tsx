import Container from "../ui/Container";

const logos = ["Product", "Engineering", "PMO", "IT Ops", "Consulting", "Support"];

export default function SocialProof() {
  return (
    <section className="border-y border-zinc-100 bg-zinc-50/40">
      <Container>
        <div className="py-10">
          <p className="text-center text-sm text-zinc-600">
            Built for teams that live in meetings and ship in tools like DevOps, Outlook, and SharePoint.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {logos.map((name) => (
              <div
                key={name}
                className="grid h-12 place-items-center rounded-2xl border border-zinc-200 bg-white text-xs font-medium text-zinc-700 shadow-sm"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}