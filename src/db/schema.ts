import { pgTable, text,boolean,timestamp, integer } from "drizzle-orm/pg-core";
import { ulid } from "ulid";

// user tables
export const user = pgTable("user", {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: boolean('email_verified').$defaultFn(() => false).notNull(),
  createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});

// agent tables
export const agents = pgTable("agents",{
  id: text("id")
    .primaryKey()
    .$defaultFn(()=>ulid()),
  name:text("name"),
  userId: text("user_id")
    .notNull()
    .references(()=>user.id, {onDelete:"cascade"}),
  instructions:text("instructions").notNull(),
  voiceSampleInstructions:text("voice_sample_instructions"),
  voiceSampleURL: text("voice_sample_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  voiceId: text("voice_id").notNull().references(()=>voices.id, {onDelete:"cascade"})
})

export const conversation = pgTable("conversation",{
  id: text("id")
    .primaryKey()
    .notNull(),
  userId: text("user_id")
    .notNull()
    .references(()=>user.id, {onDelete:"cascade"}),
  agentId: text("agent_id")
    .notNull()
    .references(()=>agents.id, {onDelete:"cascade"}),
  recording: text("recording"),
  startTimeUNIX: integer("start_time_UNIX"),
  durationSeconds: integer("duration_seconds")
})

export const voices = pgTable("voices", {
  id:text("id")
  .primaryKey().notNull(),
  name:text("name").notNull(),
  description:text("description"),
  orderNumber: integer("order_no")
})