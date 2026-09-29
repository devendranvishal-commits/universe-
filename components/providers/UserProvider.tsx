"use client";

import { createContext, useContext } from "react";
import { useUser } from "../../hooks/useUser";

const UserContext = createContext<any>(null);

export function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = useUser();

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}