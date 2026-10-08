"use client";

// Minimal client-side demo auth context.
// In production this is replaced by Supabase Auth.

import { createContext, useContext } from "react";
import type { Membership } from "@/types";

export interface DemoUser {
  id: string;
  email: string;
  membership: Membership | null; // null = visitor
}

export const DemoAuthContext = createContext<{
  user: DemoUser | null;
  signIn: (email: string) => void;
  signOut: () => void;
}>({
  user: null,
  signIn: () => {},
  signOut: () => {},
});

export function useDemoAuth() {
  return useContext(DemoAuthContext);
}
