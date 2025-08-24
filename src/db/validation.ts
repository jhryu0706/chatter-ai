import {createInsertSchema} from "drizzle-zod"
import { agents } from "./schema"
import { z } from "zod/v4"

export const agentInsertSchemaForUser = createInsertSchema(agents, {
    instructions: z.string().trim().min(1, "Instructions are required")
})
.pick({
    instructions:true
})