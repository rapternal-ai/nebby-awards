"use client";

import { useState, useCallback, type ReactNode } from "react";
import { DemoAuthContext, type DemoUser } from "@/lib/demo-auth";
import { CategoriesContext } from "@/lib/categories-context";
import { AwardsContext } from "@/lib/awards-context";
import { currentDemoUser, demoCategories, demoNominations } from "@/lib/demo-data";
import type { AwardCategory, Nomination } from "@/types";

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
  const [nominations, setNominations] = useState<Nomination[]>(demoNominations);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [votesSubmitted, setVotesSubmitted] = useState(false);

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

  const addNomination = useCallback(
    (categoryId: string, nomineeMembershipId: string, nomineeUsername: string, explanation: string) => {
      setNominations((prev) => {
        const newNom: Nomination = {
          id: `nom-${Date.now()}`,
          categoryId,
          nomineeMembershipId,
          nomineeUsername,
          nominatorUsername: "spf-NebbyMember-01", // current demo user
          explanation,
          consentStatus: "accepted",
          moderationStatus: "approved",
          voteCount: 0,
          createdAt: new Date().toISOString(),
        };
        return [...prev, newNom];
      });
    },
    [],
  );

  const castVote = useCallback((categoryId: string, nominationId: string) => {
    setVotes((prev) => ({ ...prev, [categoryId]: nominationId }));
  }, []);

  const submitVotes = useCallback(() => {
    // Increment vote counts on the selected nominations
    setNominations((prev) =>
      prev.map((n) => {
        const votedNomId = votes[n.categoryId];
        if (n.id === votedNomId) {
          return { ...n, voteCount: (n.voteCount ?? 0) + 1 };
        }
        return n;
      }),
    );
    setVotesSubmitted(true);
  }, [votes]);

  return (
    <DemoAuthContext.Provider value={{ user, signIn, signOut }}>
      <CategoriesContext.Provider
        value={{ categories, addCategory, updateCategory, removeCategory, reorderCategory }}
      >
        <AwardsContext.Provider
          value={{ nominations, addNomination, votes, castVote, submitVotes, votesSubmitted }}
        >
          {children}
        </AwardsContext.Provider>
      </CategoriesContext.Provider>
    </DemoAuthContext.Provider>
  );
}
