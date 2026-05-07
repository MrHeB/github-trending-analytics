import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "auth_token";

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || "github-trending-analytics-secret";
  return new TextEncoder().encode(secret);
}

let currentPassword: string | null = null;

export function getCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || "admin",
    password: currentPassword || process.env.ADMIN_PASSWORD || "admin123",
  };
}

export function updatePassword(newPassword: string) {
  currentPassword = newPassword;
}

export async function createToken(username: string): Promise<string> {
  return new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as { username: string };
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearAuthCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getAuthenticatedUser() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
