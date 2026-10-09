"use client";

import { createContext, useContext } from "react";
import type { Nebby, Membership, Post } from "@/types";

export interface CreateNebbyParams {
  name: string;
  shortCode: string;
  description: string;
  boundary: [number, number][];
}

export interface NebbyContextValue {
  nebbys: Nebby[];
  activeNebbyCode: string;
  activeNebby: Nebby | undefined;
  activeMembers: Membership[];
  activePosts: Post[];
  setActiveNebbyCode: (code: string) => void;
  createNebby: (params: CreateNebbyParams) => Nebby;
}

export const NebbyContext = createContext<NebbyContextValue>({
  nebbys: [],
  activeNebbyCode: "spf",
  activeNebby: undefined,
  activeMembers: [],
  activePosts: [],
  setActiveNebbyCode: () => {},
  createNebby: () => ({} as Nebby),
});

export function useNebbys() {
  return useContext(NebbyContext);
}
