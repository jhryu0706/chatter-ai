"use server"

import { db } from "@/db/index";
import { agents, user } from "@/db/schema";
import { getSessionFromCookies } from "../sessionStore";
import { agentInsertSchemaForUser } from "@/db/validation";
import { eq } from "drizzle-orm";

export type State = {success?: boolean, message?:string; error?:string};

export async function createAgent(prev: State, form: FormData): Promise<State> {
    const sid = await getSessionFromCookies()
    const userinstructions = form.get("instructions")

    const result = agentInsertSchemaForUser.safeParse({instructions: userinstructions})
    if (!result.success) {
        return {
            success: false, error: "Error creating agent."
        }
    }

    try {
        await db.insert(agents).values({
            instructions: result.data.instructions,
            userId: sid!,
        })
    } catch(err) {
        console.error("Error inserting agent to DB: ", err)
        return {error:"Error inserting agent to DB"}
    }
    return {success:true, message:"New agent added."}
  }

  export async function fetchAgents() {
    const sid = await getSessionFromCookies()
    let result;
    try {
        result = await db
        .select()
        .from(agents)
        .where(eq(agents.userId, sid!));
    } catch (err) {
        console.log(err)
    }
    return result
  }