"use client";

import { createContext, useContext } from "react";

const UserContext = createContext<{ userId: string | null }>({ userId: null });

export function UserProvider({
  userId,
  children,
}: {
  userId: string | null;
  children: React.ReactNode;
}) {
  return (
    <UserContext.Provider value={{ userId }}>{children}</UserContext.Provider>
  );
}

export function useUserID() {
  return useContext(UserContext).userId;
}
