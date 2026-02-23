import Container from "../ui/Container";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-100">
      <Container>
        <div className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold">NoteAssist</div>
            <div className="mt-1 text-sm text-zinc-600">
              Meeting notes → actions, safely.
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-zinc-600">
            <a className="hover:text-zinc-900" href="#features">Features</a>
            <a className="hover:text-zinc-900" href="#integrations">Integrations</a>
            <a className="hover:text-zinc-900" href="#security">Security</a>
            <a className="hover:text-zinc-900" href="#pricing">Pricing</a>
          </div>

          <div className="text-xs text-zinc-500">
            © {new Date().getFullYear()} NoteAssist
          </div>
        </div>
      </Container>
    </footer>
  );
}