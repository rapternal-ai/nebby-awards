"use client";

import { useParams } from "next/navigation";
import { Suspense } from "react";
import { Tabs } from "@/components/ui/tabs";
import { demoNebby } from "@/lib/demo-data";
import { useDemoAuth } from "@/lib/demo-auth";

export default function NebbyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-4">Loading...</div>}>
      <NebbyLayoutInner>{children}</NebbyLayoutInner>
    </Suspense>
  );
}

function NebbyLayoutInner({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const code = params.code as string;
  const { user } = useDemoAuth();

  const tabs = [
    { label: "Feed", href: `/nebby/${code}/feed` },
    { label: "Awards", href: `/nebby/${code}/awards` },
    { label: "About", href: `/nebby/${code}/about` },
  ];

  if (user?.membership?.role === "moderator") {
    tabs.push({ label: "Moderate", href: `/nebby/${code}/moderate` });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-4">
      {/* Nebby header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-zinc-900">{demoNebby.name}</h1>
        <p className="text-sm text-zinc-500">
          {demoNebby.memberCount} members &middot; {code}
        </p>
      </div>

      <Tabs tabs={tabs} className="mb-6" />

      {children}
    </div>
  );
}
