import Link from "next/link";
import Container from "../ui/Container";
import { buttonStyles } from "../ui/buttonStyles";

export default function FinalCTA() {
  return (
    <section className="py-14">
      <Container>
        <div className="rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Stop rewriting meeting notes into 5 different tools.
            </h2>
            <p className="mt-3 text-zinc-600">
              Write once. Select actions. Preview. Execute — across DevOps, Outlook, SharePoint, Jira, and more.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className={buttonStyles({ variant: "primary", size: "lg" })}>
                Create account
              </Link>
              <Link href="/login" className={buttonStyles({ variant: "secondary", size: "lg" })}>
                Sign in
              </Link>
            </div>

            <p className="mt-4 text-xs text-zinc-500">
              Tip: route new users to org creation after signup to match your product flow.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}