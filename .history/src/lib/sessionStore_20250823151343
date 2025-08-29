import { db } from "@/db";
import { user } from "@/db/schema";
import { Redis } from "@upstash/redis";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const EXPIRATION_IN_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionShape = {
  createdAt: number;
  lastActiveAt: number;
}

export async function getSession<T=SessionShape>(sid: string) {
  return (await kv.get<T>(`sess:${sid}`)) ?? null;
}

export async function setSession<T = SessionShape>(sid: string, data: T) {
  return (await kv.set(`sess:${sid}`, data, { ex: EXPIRATION_IN_SECONDS }));
}

export async function patchSession<T extends object>(
  sid: string,
  partial: Partial<T>
) {
  const current = ((await getSession<T>(sid)) ?? {}) as T;
  const next = { ...current, ...partial };
  await setSession(sid, next); 
  return next;
}

export async function getSessionFromCookies() {
  const jar = await cookies();
  const sid = jar.get("sid")?.value;
  return sid
}

export async function requireSid() {
  const sid = getSessionFromCookies()
  if (!sid) throw new Error("Missing session identifier.");
  return sid
}

export async function getOrCreateUser(sid: string) {
  const existing = await db
  .select()
  .from(user)
  .where(eq(user.id, sid))
  .then((rows)=> rows[0]);

  if (!existing) {
    await db.insert(user).values({
      id: sid,
    });
  }
}

export async function loadOrInitSession() {
  const sid = await requireSid()
  await getOrCreateUser(sid!);
}