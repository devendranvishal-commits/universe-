import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-[#050816]/80 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-black">
            ✦
          </div>

          <div>
            <p className="text-lg font-black tracking-tight text-white">
              Universe
            </p>
            <p className="text-xs text-gray-400">Find your community</p>
          </div>
        </Link>

        <div className="hidden items-center gap-8 text-sm text-gray-300 md:flex">
          <a className="transition hover:text-white" href="#features">
            Features
          </a>
          <a className="transition hover:text-white" href="#live-campus">
            Live Campus
          </a>
          <a className="transition hover:text-white" href="#pillars">
            Why Universe
          </a>
        </div>

        <Link
          href="/auth"
          className="rounded-full border border-white/10 bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:scale-105"
        >
          Join Universe
        </Link>
      </div>
    </nav>
  );
}