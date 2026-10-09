"use client";

import { useState, useCallback, type ReactNode } from "react";
import { DemoAuthContext, type DemoUser } from "@/lib/demo-auth";
import { CategoriesContext } from "@/lib/categories-context";
import { AwardsContext, type AddNominationParams } from "@/lib/awards-context";
import { NebbyContext, type CreateNebbyParams } from "@/lib/nebby-context";
import { currentDemoUser, demoCategories, demoNominations, demoNebby } from "@/lib/demo-data";
import type { AwardCategory, Nomination, Nebby } from "@/types";

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
  const [nebbys, setNebbys] = useState<Nebby[]>([demoNebby]);
  const [activeNebbyCode, setActiveNebbyCode] = useState("spf");
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
    (params: AddNominationParams) => {
      setNominations((prev) => {
        const newNom: Nomination = {
          id: `nom-${Date.now()}`,
          categoryId: params.categoryId,
          nomineeMembershipId: params.nomineeMembershipId,
          nomineeUsername: params.nomineeUsername,
          nomineeIsNonMember: params.nomineeIsNonMember ?? false,
          nominatorUsername: "spf-NebbyMember-01", // current demo user
          explanation: params.explanation,
          photoUrl: params.photoUrl,
          consentStatus: params.nomineeIsNonMember ? "accepted" : "accepted",
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

  const createNebby = useCallback((params: CreateNebbyParams) => {
    const newNebby: Nebby = {
      id: `nebby-${params.shortCode}`,
      shortCode: params.shortCode,
      name: params.name,
      description: params.description,
      boundary: params.boundary,
      creatorId: user?.id ?? "user-1",
      memberCount: 1,
      createdAt: new Date().toISOString(),
    };
    setNebbys((prev) => [...prev, newNebby]);
    setActiveNebbyCode(params.shortCode);
    return newNebby;
  }, [user]);

  return (
    <DemoAuthContext.Provider value={{ user, signIn, signOut }}>
      <NebbyContext.Provider
        value={{ nebbys, activeNebbyCode, setActiveNebbyCode, createNebby }}
      >
        <CategoriesContext.Provider
          value={{ categories, addCategory, updateCategory, removeCategory, reorderCategory }}
        >
          <AwardsContext.Provider
            value={{ nominations, addNomination, votes, castVote, submitVotes, votesSubmitted }}
          >
            {children}
          </AwardsContext.Provider>
        </CategoriesContext.Provider>
      </NebbyContext.Provider>
    </DemoAuthContext.Provider>
  );
}
