import Link from "next/link";
import { navItems } from "./content";
import MobileNav from "./MobileNav";
import Container from "../ui/Container";
import { buttonStyles } from "../ui/buttonStyles";
import Image from "next/image";

function Logo() {
    return (
        <Link href="/" className="flex items-center gap-2">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-zinc-200 bg-white shadow-sm">
                {/* <span className="text-sm font-semibold">NA</span> */}
                <Image
                    src="/NorbitLogo.png"
                    alt="ActionNotes"
                    width={100}
                    height={100}
                />
            </div>
            {/* <span className="text-sm font-semibold tracking-tight">Norbit</span> */}
        </Link>
    );
}

export default function Header() {
    return (
        <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/75 backdrop-blur">
            <Container>
                <div className="flex h-16 items-center justify-between">
                    <div className="flex justify-end, justify-self-start">
                        <Logo />

                    </div>
                    <div className="flex items-center gap-6">


                        <nav className="hidden items-center gap-5 md:flex">
                            {navItems.map((item) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className="text-sm text-zinc-600 hover:text-zinc-900"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </nav>
                    </div>

                    <div className="hidden items-center gap-2 md:flex">
                        <Link href="/login" className={buttonStyles({ variant: "ghost" })}>
                            Sign in
                        </Link>
                        <Link
                            href="/signup"
                            className={buttonStyles({ variant: "primary" })}
                        >
                            Get started
                        </Link>
                    </div>

                    <div className="md:hidden">
                        <MobileNav />
                    </div>
                </div>
            </Container>
        </header>
    );
}