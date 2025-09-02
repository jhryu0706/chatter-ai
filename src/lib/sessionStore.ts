"use server"

import { db } from "@/db/index";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function getSessionFromCookies() {
  const jar = await cookies();
  const sid = jar.get("sid")?.value;
  return sid
}

export async function requireSid() {
  const sid = await getSessionFromCookies()
  if (!sid) throw new Error("Unauthorized: Missing session identifier.");
  return sid
}

export async function getOrCreateUserInDB(sid: string) {
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

export async function loadOrInitSessionAuth() {
  const sid = await requireSid()
  await getOrCreateUserInDB(sid!);
}