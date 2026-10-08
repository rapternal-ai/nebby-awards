"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Tab {
  label: string;
  href: string;
}

interface TabsProps {
  tabs: Tab[];
  className?: string;
}

export function Tabs({ tabs, className }: TabsProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex gap-1 border-b border-zinc-200 overflow-x-auto",
        className,
      )}
      aria-label="Tabs"
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-b-2 border-emerald-600 text-emerald-700"
                : "text-zinc-500 hover:text-zinc-700",
            )}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
