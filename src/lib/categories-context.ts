"use client";

import { createContext, useContext } from "react";
import type { AwardCategory } from "@/types";

export interface CategoriesContextValue {
  categories: AwardCategory[];
  addCategory: (name: string, description: string) => void;
  updateCategory: (id: string, updates: Partial<Pick<AwardCategory, "name" | "description" | "enabled">>) => void;
  removeCategory: (id: string) => void;
  reorderCategory: (id: string, direction: "up" | "down") => void;
}

export const CategoriesContext = createContext<CategoriesContextValue>({
  categories: [],
  addCategory: () => {},
  updateCategory: () => {},
  removeCategory: () => {},
  reorderCategory: () => {},
});

export function useCategories() {
  return useContext(CategoriesContext);
}
