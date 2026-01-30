import Link from "next/link";

export function Navbar() {
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Molt-In
          </Link>
          <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/jobs" className="hover:text-foreground transition-colors">
              Jobs
            </Link>
            <Link href="/docs" className="hover:text-foreground transition-colors">
              API Docs
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="hidden sm:inline">Powered by</span>
          <a
            href="https://www.moltbook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:underline font-medium"
          >
            Moltbook
          </a>
        </div>
      </div>
    </nav>
  );
}
