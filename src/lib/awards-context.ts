"use client";

import { createContext, useContext } from "react";
import type { Nomination } from "@/types";

export interface AddNominationParams {
  categoryId: string;
  nomineeMembershipId: string | null;
  nomineeUsername: string;
  nomineeIsNonMember?: boolean;
  explanation: string;
  photoUrl?: string;
}

export interface AwardsContextValue {
  nominations: Nomination[];
  addNomination: (params: AddNominationParams) => Promise<void>;
  votes: Record<string, string>; // categoryId -> nominationId
  castVote: (categoryId: string, nominationId: string) => Promise<void>;
  submitVotes: () => Promise<void>;
  votesSubmitted: boolean;
}

export const AwardsContext = createContext<AwardsContextValue>({
  nominations: [],
  addNomination: () => Promise.resolve(),
  votes: {},
  castVote: () => Promise.resolve(),
  submitVotes: () => Promise.resolve(),
  votesSubmitted: false,
});

export function useAwards() {
  return useContext(AwardsContext);
}
