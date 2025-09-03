import {createAgent, openai, TextMessage} from "@inngest/agent-kit"
import { inngest } from "./client";
import { db } from "@/db";
import { agents, conversation } from "@/db/schema";
import { eq } from "drizzle-orm";
import { fetchSampleAudio } from "@/lib/elevenlabs/elevenlabs-actions";
import { conversationInsertSchema } from "@/db/validation";

const nameGeneratorAgent = createAgent({
  name: "Name Generator",
  system:
  "You are an expert labeller who will generate a short introduction of the character that the input describes."+
  "The intro should be no longer than 15 words."+
  "Create the final output in this form: "+
  "[any equivalent of hello, examples are 'what's up' or 'howdy' or 'hey' but you don't have to stick to these examples. Bonus points if you can make me laugh], I am a [description]",
  model: openai({model:"gpt-4o-mini", apiKey: process.env.OPEN_AI_API_KEY})
})

// These functions will return a boolean value: true on success, false on failure.

export const generateSampleAudio = inngest.createFunction(
  {id: "generate-agent-name"},
  {event:"agent/created"},
  async({event}) => {
    const {agentId, description, voiceId} = event.data;
    const {output} =  await nameGeneratorAgent.run(
        "Character Description: " +
        description
      );
    const content = (output[0] as TextMessage).content.toString()

    // at this point, the sample script has been loaded and we want to generate the audio
    const sample = await fetchSampleAudio(voiceId, content)

    try {
    await db
      .update(agents)
      .set({
        voiceSampleInstructions: content,
        voiceSampleURL:sample.toString()
      })
      .where(eq(agents.id,agentId ))
    } catch(err) {
      console.log(err)
      return false
    } 
    return true
  }
)

 export const createNewConversation = inngest.createFunction(
  {id: "create-new-conv"},
  {event: "conversation/created"},
  async({event}) => {
    const {agentId, conversationId, userId} = event.data

    const result = conversationInsertSchema.safeParse({
      id: conversationId,
      userId,
      agentId
    })

    if (!result.success) {
      console.error("Failed to add new conversation to database: ", result.error)
      return false;
    }

    try {
      await db
      .insert(conversation).values(result.data)
    } catch(err) {
      return false
    }
    return true
  }  
)