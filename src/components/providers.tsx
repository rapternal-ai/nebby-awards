"use client";

import { useState, useCallback, type ReactNode } from "react";
import { DemoAuthContext, type DemoUser } from "@/lib/demo-auth";
import { CategoriesContext } from "@/lib/categories-context";
import { currentDemoUser, demoCategories } from "@/lib/demo-data";
import type { AwardCategory } from "@/types";

const DEMO_USERS: Record<string, DemoUser> = {
  "member@demo.com": {
    id: "user-1",
    email: "member@demo.com",
    membership: currentDemoUser,
  },
  "visitor@demo.com": {
    id: "user-99",
    email: "visitor@demo.com",
    membership: null,
  },
};

export function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(DEMO_USERS["member@demo.com"]);
  const [categories, setCategories] = useState<AwardCategory[]>(demoCategories);

  const signIn = useCallback((email: string) => {
    const found = DEMO_USERS[email];
    setUser(found ?? DEMO_USERS["member@demo.com"]);
  }, []);

  const signOut = useCallback(() => setUser(null), []);

  const addCategory = useCallback((name: string, description: string) => {
    setCategories((prev) => {
      const maxOrder = prev.reduce((max, c) => Math.max(max, c.displayOrder), 0);
      const newCat: AwardCategory = {
        id: `cat-${Date.now()}`,
        seasonId: "season-2025",
        name,
        description,
        displayOrder: maxOrder + 1,
        enabled: true,
      };
      return [...prev, newCat];
    });
  }, []);

  const updateCategory = useCallback(
    (id: string, updates: Partial<Pick<AwardCategory, "name" | "description" | "enabled">>) => {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      );
    },
    [],
  );

  const removeCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const reorderCategory = useCallback((id: string, direction: "up" | "down") => {
    setCategories((prev) => {
      const sorted = [...prev].sort((a, b) => a.displayOrder - b.displayOrder);
      const idx = sorted.findIndex((c) => c.id === id);
      if (idx < 0) return prev;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev;
      // Swap display orders
      const orderA = sorted[idx].displayOrder;
      const orderB = sorted[swapIdx].displayOrder;
      return prev.map((c) => {
        if (c.id === sorted[idx].id) return { ...c, displayOrder: orderB };
        if (c.id === sorted[swapIdx].id) return { ...c, displayOrder: orderA };
        return c;
      });
    });
  }, []);

  return (
    <DemoAuthContext.Provider value={{ user, signIn, signOut }}>
      <CategoriesContext.Provider
        value={{ categories, addCategory, updateCategory, removeCategory, reorderCategory }}
      >
        {children}
      </CategoriesContext.Provider>
    </DemoAuthContext.Provider>
  );
}
