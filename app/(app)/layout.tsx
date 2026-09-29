"use client";

import type { ReactNode } from "react";
import AppSidebar from "../../components/layout/AppSidebar";
import useUserPresence from "./messages/hooks/useUserPresence";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({
  children,
}: AppLayoutProps) {
  useUserPresence();

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <AppSidebar />

      <div className="min-h-screen lg:ml-80">
        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}