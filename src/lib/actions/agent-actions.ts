"use server"

import { db } from "@/db/index";
import { agents, conversation, voices } from "@/db/schema";
import { agentInsertSchemaForUser, agentNameUpdateSchemaForUser } from "@/db/validation";
import { desc, eq } from "drizzle-orm";
import { Conversation, NUMBER_OF_AGENTS } from "../utils";
import { sendNewAgentToInngest } from "@/inngest/actions";
import { AgentProps } from "../ctx/agent-context";

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
    const userId=form.get("userId")?.toString()
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
            userId:userId!,
            voiceId
        }).returning({
            id:agents.id
        })

        const insertedId = inserted[0].id
        await sendNewAgentToInngest(insertedId, result.data.instructions, voiceId)
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

  export async function fetchAgents(userId:string) {
    let result;
    try {
        result = await db
        .select()
        .from(agents)
        .where(eq(agents.userId, userId!))
        .orderBy(desc(agents.createdAt))
    } catch (err) {
        console.log(err)
    }
    return result
  }

  export async function fetchOneAgent(id:string): Promise<AgentProps> {
    const agent: AgentProps = await db
      .select({
        name: agents.name,
        id: agents.id,
        instructions: agents.instructions,
        voiceId: agents.voiceId,
        voiceSampleInstructions: agents.voiceSampleInstructions,
        voiceName: voices.name,
        voiceSampleURL: agents.voiceSampleURL,
      })
      .from(agents)
      .leftJoin(voices, eq(agents.voiceId, voices.id))
      .where(eq(agents.id, id))
      .then(
        (rows) => rows[0]
        )
      return agent
    }


export async function getConversationsForAgent(agentId: string): Promise<Conversation[]> {
  const rows = await db
    .select({
      id: conversation.id,
      startTimeUNIX: conversation.startTimeUNIX,
      durationSeconds: conversation.durationSeconds,
      summary: conversation.summary,
    })
    .from(conversation)
    .where(eq(conversation.agentId, agentId))
    .orderBy(desc(conversation.startTimeUNIX));

  return rows.map(r => ({
    id: r.id,
    startTimeUNIX: Number(r.startTimeUNIX),
    durationSeconds: Number(r.durationSeconds),
    summary: r.summary ?? null,
  }));
}