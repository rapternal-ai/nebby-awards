"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDemoAuth } from "@/lib/demo-auth";
import { useNebbys } from "@/lib/nebby-context";
import { Button } from "@/components/ui/button";
import { Shield, LogOut, Settings, Home, Menu, X, Plus, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const { user, signOut } = useDemoAuth();
  const { nebbys, activeNebbyCode, setActiveNebbyCode } = useNebbys();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [nebbyDropdownOpen, setNebbyDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync active nebby from URL
  useEffect(() => {
    const match = pathname.match(/\/nebby\/([^/]+)/);
    if (match && match[1]) {
      const code = match[1];
      if (nebbys.some((n) => n.shortCode === code)) {
        setActiveNebbyCode(code);
      }
    }
  }, [pathname, nebbys, setActiveNebbyCode]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setNebbyDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const activeNebby = nebbys.find((n) => n.shortCode === activeNebbyCode);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo + Nebby picker */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-bold text-emerald-700">
            <Shield className="h-5 w-5" />
            <span className="text-lg">Nebby</span>
          </Link>

          {/* Nebby picker dropdown */}
          {user && nebbys.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setNebbyDropdownOpen(!nebbyDropdownOpen)}
                className="flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-1 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                {activeNebby?.name ?? "Select Nebby"}
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
              </button>
              {nebbyDropdownOpen && (
                <div className="absolute left-0 top-full mt-1 w-56 rounded-lg border border-zinc-200 bg-white shadow-lg z-50">
                  {nebbys.map((n) => (
                    <Link
                      key={n.shortCode}
                      href={`/nebby/${n.shortCode}/feed`}
                      onClick={() => {
                        setActiveNebbyCode(n.shortCode);
                        setNebbyDropdownOpen(false);
                      }}
                      className={cn(
                        "flex flex-col px-3 py-2 text-sm hover:bg-zinc-50 transition-colors first:rounded-t-lg last:rounded-b-lg",
                        n.shortCode === activeNebbyCode
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-zinc-700",
                      )}
                    >
                      <span className="font-medium">{n.name}</span>
                      <span className="text-xs text-zinc-400">{n.shortCode}</span>
                    </Link>
                  ))}
                  <Link
                    href="/create-nebby"
                    onClick={() => setNebbyDropdownOpen(false)}
                    className="flex items-center gap-2 border-t border-zinc-100 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors rounded-b-lg"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create a new Nebby
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop nav */}
        {user && activeNebby && (
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink href={`/nebby/${activeNebbyCode}/feed`} active={pathname.includes("/feed")}>
              Feed
            </NavLink>
            <NavLink href={`/nebby/${activeNebbyCode}/awards`} active={pathname.includes("/awards")}>
              Awards
            </NavLink>
            <NavLink href={`/nebby/${activeNebbyCode}/about`} active={pathname.includes("/about")}>
              About
            </NavLink>
            {user.membership?.role === "moderator" && (
              <NavLink href={`/nebby/${activeNebbyCode}/moderate`} active={pathname.includes("/moderate")}>
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
          {activeNebby && (
            <>
              <MobileLink href={`/nebby/${activeNebbyCode}/feed`} onClick={() => setMenuOpen(false)}>
                <Home className="h-4 w-4" /> Feed
              </MobileLink>
              <MobileLink href={`/nebby/${activeNebbyCode}/awards`} onClick={() => setMenuOpen(false)}>
                Awards
              </MobileLink>
              <MobileLink href={`/nebby/${activeNebbyCode}/about`} onClick={() => setMenuOpen(false)}>
                About
              </MobileLink>
              {user.membership?.role === "moderator" && (
                <MobileLink href={`/nebby/${activeNebbyCode}/moderate`} onClick={() => setMenuOpen(false)}>
                  Moderate
                </MobileLink>
              )}
            </>
          )}
          <MobileLink href="/create-nebby" onClick={() => setMenuOpen(false)}>
            <Plus className="h-4 w-4" /> Create Nebby
          </MobileLink>
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
