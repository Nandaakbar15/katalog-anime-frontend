import { useState, type FormEvent } from "react";
import { Link, NavLink, Outlet, ScrollRestoration, useLocation, useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, PlayIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/anime", label: "Catalogue", end: true },
];

function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <span className="grid size-9 place-items-center rounded-xl bg-linear-to-br from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-500/30">
        <HugeiconsIcon icon={PlayIcon} className="size-4" strokeWidth={2.5} />
      </span>
      <span className="text-lg font-bold tracking-tight">
        Ani<span className="text-gradient">Katalog</span>
      </span>
    </Link>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [query, setQuery] = useState("");
  const onCatalogue = pathname === "/anime";

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/anime?q=${encodeURIComponent(q)}` : "/anime");
    setQuery("");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  isActive ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {!onCatalogue && (
            <form onSubmit={onSearch} role="search" className="relative hidden sm:block">
              <HugeiconsIcon
                icon={Search01Icon}
                strokeWidth={2}
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search anime…"
                aria-label="Search anime"
                className="w-56 pl-9 lg:w-72"
              />
            </form>
          )}
          <Link
            to="/anime"
            aria-label="Browse catalogue"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden")}
          >
            <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
          </Link>
          <Link
            to="/anime/new"
            className={cn(
              buttonVariants(),
              "bg-linear-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 hover:opacity-90",
            )}
          >
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2.5} data-icon="inline-start" />
            <span className="hidden sm:inline">Add anime</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
        <Logo />
        <p>Your personal anime catalogue · {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}

export function RootLayout() {
  return (
    <div className="relative flex min-h-svh flex-col">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.16),transparent_60%)]"
      />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
