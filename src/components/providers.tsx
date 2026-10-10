"use client";

import { useState, useCallback, useEffect, type ReactNode } from "react";
import { DemoAuthContext, type DemoUser } from "@/lib/demo-auth";
import { CategoriesContext } from "@/lib/categories-context";
import { AwardsContext, type AddNominationParams } from "@/lib/awards-context";
import { NebbyContext, type CreateNebbyParams } from "@/lib/nebby-context";
import { currentDemoUser } from "@/lib/demo-data";
import {
  getNebbys,
  createNebbyInDb,
  getMembersForNebby,
  getPostsForNebby,
  getCategoriesForNebby,
  getNominationsForNebby,
} from "@/lib/db/actions";
import type {
  AwardCategory,
  Nomination,
  Nebby,
  Membership,
  Post,
} from "@/types";

// Per-Nebby data bucket (kept in memory; hydrated from DB on demand)
interface NebbyData {
  categories: AwardCategory[];
  nominations: Nomination[];
  votes: Record<string, string>;
  votesSubmitted: boolean;
  members: Membership[];
  posts: Post[];
  loaded: boolean;
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

function makeEmptyNebbyData(): NebbyData {
  return {
    categories: [],
    nominations: [],
    votes: {},
    votesSubmitted: false,
    members: [],
    posts: [],
    loaded: false,
  };
}

export function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(DEMO_USERS["member@demo.com"]);
  const [nebbys, setNebbys] = useState<Nebby[]>([]);
  const [activeNebbyCode, setActiveNebbyCode] = useState("spf");
  const [nebbyDataMap, setNebbyDataMap] = useState<Record<string, NebbyData>>({});
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Load all Nebbys on mount
  useEffect(() => {
    let cancelled = false;
    getNebbys().then((loaded) => {
      if (cancelled) return;
      setNebbys(loaded);
      setInitialLoadDone(true);
      // If the seeded spf nebby exists, make it active and load its data
      if (loaded.some((n) => n.shortCode === "spf")) {
        setActiveNebbyCode("spf");
      } else if (loaded.length > 0) {
        setActiveNebbyCode(loaded[0].shortCode);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Hydrate active Nebby data from DB when it changes
  useEffect(() => {
    if (!initialLoadDone) return;
    const activeNebby = nebbys.find((n) => n.shortCode === activeNebbyCode);
    if (!activeNebby) return;

    const existing = nebbyDataMap[activeNebbyCode];
    if (existing?.loaded) return;

    let cancelled = false;
    Promise.all([
      getMembersForNebby(activeNebby.id),
      getPostsForNebby(activeNebby.id),
      getCategoriesForNebby(activeNebby.id),
      getNominationsForNebby(activeNebby.id),
    ]).then(([members, posts, categories, nominations]) => {
      if (cancelled) return;
      setNebbyDataMap((prev) => ({
        ...prev,
        [activeNebbyCode]: {
          ...(prev[activeNebbyCode] ?? makeEmptyNebbyData()),
          members,
          posts,
          categories,
          nominations,
          loaded: true,
        },
      }));
    });

    return () => {
      cancelled = true;
    };
  }, [activeNebbyCode, initialLoadDone, nebbys, nebbyDataMap]);

  const activeData = nebbyDataMap[activeNebbyCode] ?? makeEmptyNebbyData();

  function updateActive<K extends keyof NebbyData>(
    key: K,
    updater: (prev: NebbyData[K]) => NebbyData[K],
  ) {
    setNebbyDataMap((prev) => {
      const current = prev[activeNebbyCode] ?? makeEmptyNebbyData();
      return {
        ...prev,
        [activeNebbyCode]: { ...current, [key]: updater(current[key]) },
      };
    });
  }

  // ── Auth ──
  const signIn = useCallback((email: string) => {
    const found = DEMO_USERS[email];
    setUser(found ?? DEMO_USERS["member@demo.com"]);
  }, []);

  const signOut = useCallback(() => setUser(null), []);

  // ── Categories (scoped to active Nebby) ──
  const addCategory = useCallback(
    (name: string, description: string) => {
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeNebbyCode],
  );

  const updateCategory = useCallback(
    (id: string, updates: Partial<Pick<AwardCategory, "name" | "description" | "enabled">>) => {
      updateActive("categories", (prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeNebbyCode],
  );

  const removeCategory = useCallback(
    (id: string) => {
      updateActive("categories", (prev) => prev.filter((c) => c.id !== id));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeNebbyCode],
  );

  const reorderCategory = useCallback(
    (id: string, direction: "up" | "down") => {
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeNebbyCode],
  );

  // ── Awards (scoped to active Nebby) ──
  const addNomination = useCallback(
    (params: AddNominationParams) => {
      updateActive("nominations", (prev) => {
        const nominatorName =
          activeData.members[0]?.username ?? `${activeNebbyCode}-NebbyMember-01`;
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
    [activeNebbyCode, activeData.members],
  );

  const castVote = useCallback(
    (categoryId: string, nominationId: string) => {
      updateActive("votes", (prev) => ({ ...prev, [categoryId]: nominationId }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeNebbyCode],
  );

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
  const createNebby = useCallback(
    async (params: CreateNebbyParams) => {
      const newNebby = await createNebbyInDb({
        id: `nebby-${params.shortCode}`,
        shortCode: params.shortCode,
        name: params.name,
        description: params.description,
        boundary: params.boundary,
        creatorId: user?.id ?? "user-1",
      });
      setNebbys((prev) => [...prev, newNebby]);
      setActiveNebbyCode(params.shortCode);
      setNebbyDataMap((prev) => ({
        ...prev,
        [params.shortCode]: {
          ...makeEmptyNebbyData(),
          members: [
            {
              id: `mem-${params.shortCode}-1`,
              nebbyId: newNebby.id,
              userId: user?.id ?? "user-1",
              memberNumber: 1,
              username: `${params.shortCode}-NebbyMember-01`,
              status: "approved",
              role: "moderator",
              approvedAt: new Date().toISOString(),
            },
          ],
          loaded: true,
        },
      }));
      return newNebby;
    },
    [user],
  );

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
