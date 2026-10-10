"use client";

import { createContext, useContext } from "react";
import type { AwardCategory } from "@/types";

export interface CategoriesContextValue {
  categories: AwardCategory[];
  addCategory: (name: string, description: string) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Pick<AwardCategory, "name" | "description" | "enabled">>) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  reorderCategory: (id: string, direction: "up" | "down") => Promise<void>;
}

export const CategoriesContext = createContext<CategoriesContextValue>({
  categories: [],
  addCategory: () => Promise.resolve(),
  updateCategory: () => Promise.resolve(),
  removeCategory: () => Promise.resolve(),
  reorderCategory: () => Promise.resolve(),
});

export function useCategories() {
  return useContext(CategoriesContext);
}
