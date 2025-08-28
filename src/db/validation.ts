import {createInsertSchema} from "drizzle-zod"
import { agents, voices } from "./schema"
import { z } from "zod/v4"

export const agentInsertSchemaForUser = createInsertSchema(agents, {
    instructions: z.string().trim().min(1, "Instructions are required")
})
.pick({
    instructions:true
})

export const agentNameUpdateSchemaForUser = createInsertSchema(agents, {
    name: z
    .string()
    .trim()
    .max(20, "The maximum length for an agent name is 20 characters. Provide a shorter name.")
    .min(1, "The input is empty.")
})
.pick({
    name:true
})