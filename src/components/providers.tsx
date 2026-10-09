"use client";

import { useState, useCallback, useMemo, type ReactNode } from "react";
import { DemoAuthContext, type DemoUser } from "@/lib/demo-auth";
import { CategoriesContext } from "@/lib/categories-context";
import { AwardsContext, type AddNominationParams } from "@/lib/awards-context";
import { NebbyContext, type CreateNebbyParams } from "@/lib/nebby-context";
import {
  currentDemoUser,
  demoCategories,
  demoNominations,
  demoNebby,
  demoMembers,
  demoPosts,
} from "@/lib/demo-data";
import type { AwardCategory, Nomination, Nebby, Membership, Post } from "@/types";

// Per-Nebby data bucket
interface NebbyData {
  categories: AwardCategory[];
  nominations: Nomination[];
  votes: Record<string, string>;
  votesSubmitted: boolean;
  members: Membership[];
  posts: Post[];
}

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

// Default demo data for Spruce Field
const SPF_DATA: NebbyData = {
  categories: demoCategories,
  nominations: demoNominations,
  votes: {},
  votesSubmitted: false,
  members: demoMembers,
  posts: demoPosts,
};

function makeEmptyNebbyData(shortCode: string): NebbyData {
  return {
    categories: [],
    nominations: [],
    votes: {},
    votesSubmitted: false,
    members: [
      {
        id: `mem-${shortCode}-1`,
        nebbyId: `nebby-${shortCode}`,
        userId: "user-1",
        memberNumber: 1,
        username: `${shortCode}-NebbyMember-01`,
        status: "approved",
        role: "moderator",
        approvedAt: new Date().toISOString(),
        approxLocation: undefined,
      },
    ],
    posts: [],
  };
}

export function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(DEMO_USERS["member@demo.com"]);
  const [nebbys, setNebbys] = useState<Nebby[]>([demoNebby]);
  const [activeNebbyCode, setActiveNebbyCode] = useState("spf");

  // Per-Nebby data store keyed by short code
  const [nebbyDataMap, setNebbyDataMap] = useState<Record<string, NebbyData>>({
    spf: SPF_DATA,
  });

  // Helper to update a field in the active Nebby's data
  function updateActive<K extends keyof NebbyData>(
    key: K,
    updater: (prev: NebbyData[K]) => NebbyData[K],
  ) {
    setNebbyDataMap((prev) => {
      const current = prev[activeNebbyCode] ?? makeEmptyNebbyData(activeNebbyCode);
      return {
        ...prev,
        [activeNebbyCode]: { ...current, [key]: updater(current[key]) },
      };
    });
  }

  const activeData = nebbyDataMap[activeNebbyCode] ?? makeEmptyNebbyData(activeNebbyCode);

  // ── Auth ──
  const signIn = useCallback((email: string) => {
    const found = DEMO_USERS[email];
    setUser(found ?? DEMO_USERS["member@demo.com"]);
  }, []);

  const signOut = useCallback(() => setUser(null), []);

  // ── Categories (scoped to active Nebby) ──
  const addCategory = useCallback((name: string, description: string) => {
    updateActive("categories", (prev) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNebbyCode]);

  const updateCategory = useCallback(
    (id: string, updates: Partial<Pick<AwardCategory, "name" | "description" | "enabled">>) => {
      updateActive("categories", (prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeNebbyCode],
  );

  const removeCategory = useCallback((id: string) => {
    updateActive("categories", (prev) => prev.filter((c) => c.id !== id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNebbyCode]);

  const reorderCategory = useCallback((id: string, direction: "up" | "down") => {
    updateActive("categories", (prev) => {
      const sorted = [...prev].sort((a, b) => a.displayOrder - b.displayOrder);
      const idx = sorted.findIndex((c) => c.id === id);
      if (idx < 0) return prev;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev;
      const orderA = sorted[idx].displayOrder;
      const orderB = sorted[swapIdx].displayOrder;
      return prev.map((c) => {
        if (c.id === sorted[idx].id) return { ...c, displayOrder: orderB };
        if (c.id === sorted[swapIdx].id) return { ...c, displayOrder: orderA };
        return c;
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNebbyCode]);

  // ── Awards (scoped to active Nebby) ──
  const addNomination = useCallback(
    (params: AddNominationParams) => {
      updateActive("nominations", (prev) => {
        const activeMembers = (nebbyDataMap[activeNebbyCode] ?? makeEmptyNebbyData(activeNebbyCode)).members;
        const nominatorName = activeMembers[0]?.username ?? `${activeNebbyCode}-NebbyMember-01`;
        const newNom: Nomination = {
          id: `nom-${Date.now()}`,
          categoryId: params.categoryId,
          nomineeMembershipId: params.nomineeMembershipId,
          nomineeUsername: params.nomineeUsername,
          nomineeIsNonMember: params.nomineeIsNonMember ?? false,
          nominatorUsername: nominatorName,
          explanation: params.explanation,
          photoUrl: params.photoUrl,
          consentStatus: "accepted",
          moderationStatus: "approved",
          voteCount: 0,
          createdAt: new Date().toISOString(),
        };
        return [...prev, newNom];
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeNebbyCode, nebbyDataMap],
  );

  const castVote = useCallback((categoryId: string, nominationId: string) => {
    updateActive("votes", (prev) => ({ ...prev, [categoryId]: nominationId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNebbyCode]);

  const submitVotes = useCallback(() => {
    const currentVotes = activeData.votes;
    updateActive("nominations", (prev) =>
      prev.map((n) => {
        const votedNomId = currentVotes[n.categoryId];
        if (n.id === votedNomId) {
          return { ...n, voteCount: (n.voteCount ?? 0) + 1 };
        }
        return n;
      }),
    );
    updateActive("votesSubmitted", () => true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNebbyCode, activeData.votes]);

  // ── Nebby management ──
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
    setNebbyDataMap((prev) => ({
      ...prev,
      [params.shortCode]: makeEmptyNebbyData(params.shortCode),
    }));
    setActiveNebbyCode(params.shortCode);
    return newNebby;
  }, [user]);

  return (
    <DemoAuthContext.Provider value={{ user, signIn, signOut }}>
      <NebbyContext.Provider
        value={{
          nebbys,
          activeNebbyCode,
          activeNebby: nebbys.find((n) => n.shortCode === activeNebbyCode),
          activeMembers: activeData.members,
          activePosts: activeData.posts,
          setActiveNebbyCode,
          createNebby,
        }}
      >
        <CategoriesContext.Provider
          value={{
            categories: activeData.categories,
            addCategory,
            updateCategory,
            removeCategory,
            reorderCategory,
          }}
        >
          <AwardsContext.Provider
            value={{
              nominations: activeData.nominations,
              addNomination,
              votes: activeData.votes,
              castVote,
              submitVotes,
              votesSubmitted: activeData.votesSubmitted,
            }}
          >
            {children}
          </AwardsContext.Provider>
        </CategoriesContext.Provider>
      </NebbyContext.Provider>
    </DemoAuthContext.Provider>
  );
}
