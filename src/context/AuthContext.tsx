"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface UserProfile {
  id: string;
  name: string;
  nickname?: string | null;
  email: string;
  role: string;
  avatarUrl?: string | null;
  birthday?: string | null;
  favoriteThings?: string | null;
  spotifyProfileUrl?: string | null;
}

export interface CoupleSettings {
  partner1Name: string;
  partner2Name: string;
  anniversaryDate: string;
  relationshipQuote: string;
  coverPhotoUrl?: string | null;
  spotifyPlaylistUrl?: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  partner: UserProfile | null;
  coupleSettings: CoupleSettings | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [partner, setPartner] = useState<UserProfile | null>(null);
  const [coupleSettings, setCoupleSettings] = useState<CoupleSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setPartner(data.partner);
        setCoupleSettings(data.coupleSettings);
      } else {
        setUser(null);
        setPartner(null);
      }
    } catch {
      setUser(null);
      setPartner(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Authentication failed" };
      }
      await checkAuth();
      return { success: true };
    } catch (err) {
      return { success: false, error: "Network error occurred during login" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setPartner(null);
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        partner,
        coupleSettings,
        loading,
        login,
        logout,
        refreshAuth: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
