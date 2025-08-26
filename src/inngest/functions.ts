import {createAgent, openai, TextMessage} from "@inngest/agent-kit"
import { inngest } from "./client";
import { db } from "@/db";
import { agents } from "@/db/schema";
import { FileOutput } from "lucide-react";
import { eq } from "drizzle-orm";

const nameGeneratorAgent = createAgent({
  name: "Name Generator",
  system:
  `You are an expert labeller who will generate a short description of the character that the input describes.` +
  'The generated description should be no longer than 10 words.'.trim(),
  model: openai({model:"gpt-4o-mini", apiKey: process.env.OPEN_AI_API_KEY})
})

export const generateAgentName = inngest.createFunction(
  {id: "generate-agent-name"},
  {event:"ai/generate.agent.name"},
  async({event, step}) => {
    const {output} =  await nameGeneratorAgent.run(
        "Character Description: " +
        event.data.description
      );
    const content = (output[0] as TextMessage).content.toString()
    
    const result = await db
    .update(agents)
    .set({
      cleaned_instructions: content
    })
    .where(eq(event.data.agentId, agents.id))
    
    return result
  }
)