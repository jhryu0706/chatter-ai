"use server"

import { db } from "@/db/index";
import { agents, user } from "@/db/schema";
import { getSessionFromCookies } from "../sessionStore";
import { agentInsertSchemaForUser, agentNameUpdateSchemaForUser } from "@/db/validation";
import { desc, eq } from "drizzle-orm";
import { inngest } from "@/inngest/client";

export type State = {success?: boolean, message?:string; error?:string};

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

    try {
        const inserted = await db.insert(agents).values({
            instructions: result.data.instructions,
            userId: sid!,
        }).returning({
            id:agents.id
        })

        const insertedId = inserted[0].id

        inngest.send({
            name:"ai/generate.agent.name",
            data: {
                "agentId": insertedId,
                "description": result.data.instructions
        }
        })
    } catch(err) {
        console.error("Error inserting agent to DB: ", err)
        return {error:"Error inserting agent to DB"}
    }
    return {success:true, message:"New agent added."}
  }

  export async function updateAgentName(prev: State, form:FormData): Promise<State> {
    const newName = form.get("newName")

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
        .where(eq(agents.id!,form.get("agentId")?.toString()!))
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