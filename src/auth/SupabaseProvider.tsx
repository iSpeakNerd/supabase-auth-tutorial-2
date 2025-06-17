"use client";

import { User } from "@supabase/supabase-js";
import { useState, type ReactNode, createContext, useContext } from "react";
import { createSupabaseClient, getUser } from "./client";

const SupabaseContext = createContext<{ user: User | null }>({ user: null });

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
};

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const { auth } = createSupabaseClient();

  //   initial user
  auth.getUser().then(({ data: { user } }) => setUser(user));

  //   update in time
  auth.onAuthStateChange((event, session) => {
    console.log("auth changed, user= ", user);
    setUser(session?.user ?? null);
  });
  console.log("user is ", user);
  return (
    <SupabaseContext.Provider value={{ user }}>
      {children}
    </SupabaseContext.Provider>
  );
}
