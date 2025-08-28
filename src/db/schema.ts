import { int } from "drizzle-orm/mysql-core";
import { pgTable, text,boolean,timestamp, pgEnum } from "drizzle-orm/pg-core";
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
  cleaned_instructions:text("cleaned_instructions"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
})

export const meetingStatus = pgEnum("meeting_status", [
  "upcoming",
  "active",
  "completed",
  "processing",
  "cancelled"
])

export const meetings = pgTable("meetings",{
  id: text("id")
    .primaryKey()
    .$defaultFn(()=>ulid()),
  name:text("name").notNull(),
  userId: text("user_id")
    .notNull()
    .references(()=>user.id, {onDelete:"cascade"}),
  agentId: text("agent_id")
    .notNull()
    .references(()=>agents.id, {onDelete:"cascade"}),
  status: meetingStatus("status").notNull().default("upcoming"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  transcriptUrl: text("transcript_url"),
  recordingUrl: text("recording_url"),
  summary: text("summary"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
})

export const voices = pgTable("voices", {
  id:text("id")
  .primaryKey().notNull(),
  name:text("name").notNull(),
  description:text("description"),
  orderNumber: int("order_no")
})