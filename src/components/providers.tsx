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
  createPostInDb,
  createCategoryInDb,
  updateCategoryInDb,
  deleteCategoryInDb,
  createNominationInDb,
  createVoteInDb,
  incrementNominationVoteCount,
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
    async (name: string, description: string) => {
      const nebby = nebbys.find((n) => n.shortCode === activeNebbyCode);
      if (!nebby) return;
      const maxOrder = activeData.categories.reduce(
        (max, c) => Math.max(max, c.displayOrder),
        0,
      );
      const newCat = await createCategoryInDb({
        nebbyId: nebby.id,
        seasonId: "season-2025",
        name,
        description,
        displayOrder: maxOrder + 1,
      });
      updateActive("categories", (prev) => [...prev, newCat]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeNebbyCode, activeData.categories, nebbys],
  );

  const updateCategory = useCallback(
    async (
      id: string,
      updates: Partial<Pick<AwardCategory, "name" | "description" | "enabled">>,
    ) => {
      await updateCategoryInDb(id, updates);
      updateActive("categories", (prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeNebbyCode],
  );

  const removeCategory = useCallback(
    async (id: string) => {
      await deleteCategoryInDb(id);
      updateActive("categories", (prev) => prev.filter((c) => c.id !== id));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeNebbyCode],
  );

  const reorderCategory = useCallback(
    async (id: string, direction: "up" | "down") => {
      const sorted = [...activeData.categories].sort(
        (a, b) => a.displayOrder - b.displayOrder,
      );
      const idx = sorted.findIndex((c) => c.id === id);
      if (idx < 0) return;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return;
      const orderA = sorted[idx].displayOrder;
      const orderB = sorted[swapIdx].displayOrder;
      await Promise.all([
        updateCategoryInDb(sorted[idx].id, { displayOrder: orderB }),
        updateCategoryInDb(sorted[swapIdx].id, { displayOrder: orderA }),
      ]);
      updateActive("categories", (prev) =>
        prev.map((c) => {
          if (c.id === sorted[idx].id) return { ...c, displayOrder: orderB };
          if (c.id === sorted[swapIdx].id) return { ...c, displayOrder: orderA };
          return c;
        }),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeNebbyCode, activeData.categories],
  );

  // ── Awards (scoped to active Nebby) ──
  const addNomination = useCallback(
    async (params: AddNominationParams) => {
      const nebby = nebbys.find((n) => n.shortCode === activeNebbyCode);
      if (!nebby) return;
      const nominatorName =
        activeData.members[0]?.username ?? `${activeNebbyCode}-NebbyMember-01`;
      const newNom = await createNominationInDb({
        nebbyId: nebby.id,
        categoryId: params.categoryId,
        nomineeMembershipId: params.nomineeMembershipId,
        nomineeUsername: params.nomineeUsername,
        nomineeIsNonMember: params.nomineeIsNonMember ?? false,
        nominatorUsername: nominatorName,
        explanation: params.explanation,
        photoUrl: params.photoUrl,
      });
      updateActive("nominations", (prev) => [...prev, newNom]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeNebbyCode, activeData.members, nebbys],
  );

  const castVote = useCallback(
    async (categoryId: string, nominationId: string) => {
      updateActive("votes", (prev) => ({ ...prev, [categoryId]: nominationId }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeNebbyCode],
  );

  const submitVotes = useCallback(async () => {
    const nebby = nebbys.find((n) => n.shortCode === activeNebbyCode);
    if (!nebby) return;
    const currentVotes = activeData.votes;
    const votedNomIds = Object.values(currentVotes);

    await Promise.all(
      votedNomIds.map(async (nominationId) => {
        const categoryId = Object.keys(currentVotes).find(
          (k) => currentVotes[k] === nominationId,
        );
        if (!categoryId) return;
        await createVoteInDb({
          nebbyId: nebby.id,
          categoryId,
          nominationId,
          voterUserId: user?.id ?? "user-1",
        });
        await incrementNominationVoteCount(nominationId);
      }),
    );

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
  }, [activeNebbyCode, activeData.votes, nebbys, user]);

  // ── Posts (scoped to active Nebby) ──
  const createPost = useCallback(
    async (body: string) => {
      const nebby = nebbys.find((n) => n.shortCode === activeNebbyCode);
      if (!nebby) throw new Error("No active Nebby");
      const authorUsername =
        activeData.members[0]?.username ?? `${activeNebbyCode}-NebbyMember-01`;
      const newPost = await createPostInDb({
        nebbyId: nebby.id,
        authorUsername,
        body,
      });
      updateActive("posts", (prev) => [newPost, ...prev]);
      return newPost;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeNebbyCode, activeData.members, nebbys],
  );

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
          createPost,
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
