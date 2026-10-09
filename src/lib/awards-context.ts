"use client";

import { createContext, useContext } from "react";
import type { Nomination } from "@/types";

export interface AwardsContextValue {
  nominations: Nomination[];
  addNomination: (categoryId: string, nomineeMembershipId: string, nomineeUsername: string, explanation: string) => void;
  votes: Record<string, string>; // categoryId -> nominationId
  castVote: (categoryId: string, nominationId: string) => void;
  submitVotes: () => void;
  votesSubmitted: boolean;
}

export const AwardsContext = createContext<AwardsContextValue>({
  nominations: [],
  addNomination: () => {},
  votes: {},
  castVote: () => {},
  submitVotes: () => {},
  votesSubmitted: false,
});

export function useAwards() {
  return useContext(AwardsContext);
}
