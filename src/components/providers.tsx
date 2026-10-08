"use client";

import { useState, useCallback, type ReactNode } from "react";
import { DemoAuthContext, type DemoUser } from "@/lib/demo-auth";
import { currentDemoUser } from "@/lib/demo-data";

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

export function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(DEMO_USERS["member@demo.com"]);

  const signIn = useCallback((email: string) => {
    const found = DEMO_USERS[email];
    setUser(found ?? DEMO_USERS["member@demo.com"]);
  }, []);

  const signOut = useCallback(() => setUser(null), []);

  return (
    <DemoAuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </DemoAuthContext.Provider>
  );
}
