"use client";

import { createContext, useContext } from "react";
import type { Nebby } from "@/types";

export interface CreateNebbyParams {
  name: string;
  shortCode: string;
  description: string;
  boundary: [number, number][];
}

export interface NebbyContextValue {
  nebbys: Nebby[];
  activeNebbyCode: string;
  setActiveNebbyCode: (code: string) => void;
  createNebby: (params: CreateNebbyParams) => Nebby;
}

export const NebbyContext = createContext<NebbyContextValue>({
  nebbys: [],
  activeNebbyCode: "spf",
  setActiveNebbyCode: () => {},
  createNebby: () => ({} as Nebby),
});

export function useNebbys() {
  return useContext(NebbyContext);
}
