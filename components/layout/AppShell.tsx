"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import StarterOnboarding from "@/components/onboarding/StarterOnboarding";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  // The auth page renders its own full-screen layout — no sidebar/gating around it.
  const isAuthPage = pathname === "/auth";

  useEffect(() => {
    if (!loading && !user && !isAuthPage) {
      router.replace("/auth");
    }
  }, [loading, user, isAuthPage, router]);

  if (isAuthPage) return <>{children}</>;

  if (loading) {
    return <div className="min-h-screen bg-bg" />;
  }

  if (!user) {
    // useEffect above is already redirecting; render nothing in the meantime.
    return <div className="min-h-screen bg-bg" />;
  }

  if (!profile?.has_chosen_starter) {
    return <StarterOnboarding />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="w-full min-w-0 max-w-[1180px] px-4 pb-24 pt-5 md:px-7.5 md:pb-14">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
