import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "an_private_couple_secret_key_luxury_memory_vault_2026";
export const COOKIE_NAME = "our_story_session";

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

// In-memory rate limiter for login attempts: max 5 attempts per IP per 5 minutes
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 5 * 60 * 1000 });
    return true;
  }
  if (now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 5 * 60 * 1000 });
    return true;
  }
  if (record.count >= 8) {
    return false;
  }
  record.count += 1;
  return true;
}

export function createSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload || !payload.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      nickname: true,
      role: true,
      avatarUrl: true,
      birthday: true,
      favoriteThings: true,
      spotifyProfileUrl: true,
      createdAt: true,
    },
  });

  return user;
}

export async function getPartnerUser(currentUserId: string) {
  const partner = await prisma.user.findFirst({
    where: {
      id: { not: currentUserId },
    },
    select: {
      id: true,
      email: true,
      name: true,
      nickname: true,
      role: true,
      avatarUrl: true,
      birthday: true,
      favoriteThings: true,
      spotifyProfileUrl: true,
      createdAt: true,
    },
  });
  return partner;
}

export async function verifyVaultPin(enteredPin: string): Promise<boolean> {
  const settings = await prisma.coupleSettings.findUnique({
    where: { id: "couple-singleton" },
  });
  if (!settings || !settings.vaultPinHash) return false;
  return bcrypt.compare(enteredPin, settings.vaultPinHash);
}
