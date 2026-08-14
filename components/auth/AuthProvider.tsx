"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { ProfileRow, OwnedCardRow, OpenCrateResponse, ClaimBattleRewardResponse } from "@/lib/supabase/types";

interface AuthContextValue {
  user: User | null;
  profile: ProfileRow | null;
  ownedCards: OwnedCardRow[];
  loading: boolean;
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  rerollUsername: () => Promise<void>;
  chooseStarter: (cardId: number) => Promise<void>;
  startBattle: () => Promise<string>;
  claimBattleReward: (battleId: string, result: "win" | "loss") => Promise<ClaimBattleRewardResponse>;
  openCrate: (crateId: string) => Promise<OpenCrateResponse>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [ownedCards, setOwnedCards] = useState<OwnedCardRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData.session?.user ?? null;
    setUser(currentUser);

    if (!currentUser) {
      setProfile(null);
      setOwnedCards([]);
      setLoading(false);
      return;
    }

    const [{ data: profileData }, { data: cardsData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", currentUser.id).single(),
      supabase.from("owned_cards").select("*").eq("user_id", currentUser.id),
    ]);

    setProfile((profileData as ProfileRow) ?? null);
    setOwnedCards((cardsData as OwnedCardRow[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    refreshProfile();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      refreshProfile();
    });
    return () => listener.subscription.unsubscribe();
  }, [refreshProfile, supabase]);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return error?.message ?? null;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const rerollUsername = async () => {
    const { error } = await supabase.rpc("reroll_username");
    if (error) throw error;
    await refreshProfile();
  };

  const chooseStarter = async (cardId: number) => {
    const { error } = await supabase.rpc("choose_starter", { starter_card_id: cardId });
    if (error) throw error;
    await refreshProfile();
  };

  const startBattle = async () => {
    const { data, error } = await supabase.rpc("start_battle");
    if (error) throw error;
    return data as string;
  };

  const claimBattleReward = async (battleId: string, result: "win" | "loss") => {
    const { data, error } = await supabase.rpc("claim_battle_reward", { battle_id: battleId, result });
    if (error) throw error;
    await refreshProfile();
    return data as ClaimBattleRewardResponse;
  };

  const openCrate = async (crateId: string) => {
    const { data, error } = await supabase.rpc("open_crate", { crate_id: crateId });
    if (error) throw error;
    await refreshProfile();
    return data as OpenCrateResponse;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        ownedCards,
        loading,
        signUp,
        signIn,
        signOut,
        rerollUsername,
        chooseStarter,
        startBattle,
        claimBattleReward,
        openCrate,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
