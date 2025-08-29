"use server"

import { db } from "@/db/index";
import { agents, voices } from "@/db/schema";
import { getSessionFromCookies } from "../sessionStore";
import { agentInsertSchemaForUser, agentNameUpdateSchemaForUser } from "@/db/validation";
import { desc, eq } from "drizzle-orm";
import { inngest } from "@/inngest/client";
import { NUMBER_OF_AGENTS } from "../utils";

export type State = {success?: boolean, message?:string; error?:string};

async function assignVoice(): Promise<string> {
        const rand = Math.floor(Math.random()*NUMBER_OF_AGENTS)
        const result = await db
        .select({id:voices.id})
        .from(voices)
        .where(eq(voices.orderNumber, rand))
        .limit(1)
        return result[0]?.id??null;
    }

export async function createNewAgent(prev: State, form: FormData): Promise<State> {
    const sid = await getSessionFromCookies()
    const userinstructions = form.get("instructions")

    const result = agentInsertSchemaForUser.safeParse({instructions: userinstructions})
    if (!result.success) {
        console.log(result.error)
        return {
            success: false, error: result.error.message
        }
    }
    
    // randomly assigning a voice
    const voiceId = await assignVoice()

    try {
        const inserted = await db.insert(agents).values({
            instructions: result.data.instructions,
            userId: sid!,
            voiceId
        }).returning({
            id:agents.id
        })

        const insertedId = inserted[0].id

        inngest.send({
            name:"agent/created",
            data: {
                "agentId": insertedId,
                "description": result.data.instructions,
                "voiceId": voiceId
            }
        })
    } catch(err) {
        console.error("Error inserting agent to DB: ", err)
        return {error:"Error inserting agent to DB"}
    }
    return {success:true, message:"New agent added."}
  }

  export async function updateAgentName(prev: State, form:FormData): Promise<State> {
    const newName = form.get("newName")?.toString() ?? "";
    const agentId = form.get("agentId")?.toString() ?? "";

    if (!newName || !agentId) throw new Error("Missing form fields");

    const result = agentNameUpdateSchemaForUser.safeParse({name:newName})
    if (!result.success) {
        console.log(result.error)
        return {
            success: false, error: result.error.message
        }
    }

    try {
        await db
        .update(agents)
        .set({
            name:result.data.name
        })
        .where(eq(agents.id!,agentId!))
    } catch(err) {
        console.error("Error inserting agent to DB: ", err)
        return {success:false, error:"Error inserting agent to DB"}
    }
    return {success:true, message:"Successfully updated agent"}
  }

  export async function deleteAgent(prev:State, form:FormData): Promise<State>{
    const id = form.get("agentId")?.toString()

    try {
        await db.delete(agents).where(eq(agents.id!, id!))
    } catch(err) {
        console.log(err)
        return {success:false, error: "Error deleting agent."}
    }
    return {success:true, message:"Successfully deleted agent"}
  }

  export async function fetchAgents() {
    const sid = await getSessionFromCookies()
    let result;
    try {
        result = await db
        .select()
        .from(agents)
        .where(eq(agents.userId, sid!))
        .orderBy(desc(agents.createdAt))
    } catch (err) {
        console.log(err)
    }
    return result
  }

  export async function fetchOneAgent(id:string) {
    const agent = await db
    .select()
    .from(agents)
    .where(eq(agents.id, id))
    .then((rows) => rows[0]);
    return agent
  }