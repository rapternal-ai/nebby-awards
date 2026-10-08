"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDemoAuth } from "@/lib/demo-auth";
import { Button } from "@/components/ui/button";
import { Shield, LogOut, Settings, Home, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const { user, signOut } = useDemoAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const nebbyCode = "spf"; // demo nebby

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-emerald-700">
          <Shield className="h-5 w-5" />
          <span className="text-lg">Nebby</span>
        </Link>

        {/* Desktop nav */}
        {user && (
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink href={`/nebby/${nebbyCode}/feed`} active={pathname.includes("/feed")}>
              Feed
            </NavLink>
            <NavLink href={`/nebby/${nebbyCode}/awards`} active={pathname.includes("/awards")}>
              Awards
            </NavLink>
            <NavLink href={`/nebby/${nebbyCode}/about`} active={pathname.includes("/about")}>
              About
            </NavLink>
            {user.membership?.role === "moderator" && (
              <NavLink href={`/nebby/${nebbyCode}/moderate`} active={pathname.includes("/moderate")}>
                Moderate
              </NavLink>
            )}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-sm text-zinc-500 md:inline">
                {user.membership?.username ?? "Visitor"}
              </span>
              <Link href="/settings" aria-label="Settings">
                <Settings className="h-5 w-5 text-zinc-400 hover:text-zinc-600" />
              </Link>
              <button onClick={signOut} aria-label="Sign out" className="text-zinc-400 hover:text-zinc-600">
                <LogOut className="h-5 w-5" />
              </button>
              {/* Mobile hamburger */}
              <button
                className="md:hidden text-zinc-500"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Join</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && user && (
        <nav className="border-t border-zinc-100 bg-white px-4 pb-3 md:hidden">
          <MobileLink href={`/nebby/${nebbyCode}/feed`} onClick={() => setMenuOpen(false)}>
            <Home className="h-4 w-4" /> Feed
          </MobileLink>
          <MobileLink href={`/nebby/${nebbyCode}/awards`} onClick={() => setMenuOpen(false)}>
            Awards
          </MobileLink>
          <MobileLink href={`/nebby/${nebbyCode}/about`} onClick={() => setMenuOpen(false)}>
            About
          </MobileLink>
          {user.membership?.role === "moderator" && (
            <MobileLink href={`/nebby/${nebbyCode}/moderate`} onClick={() => setMenuOpen(false)}>
              Moderate
            </MobileLink>
          )}
          <MobileLink href="/settings" onClick={() => setMenuOpen(false)}>
            <Settings className="h-4 w-4" /> Settings
          </MobileLink>
        </nav>
      )}
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-emerald-50 text-emerald-700"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-800",
      )}
    >
      {children}
    </Link>
  );
}

function MobileLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 py-2.5 text-sm font-medium text-zinc-700 hover:text-emerald-600"
    >
      {children}
    </Link>
  );
}
