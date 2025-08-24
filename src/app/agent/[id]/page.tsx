import { db } from "@/db";
import { agents } from "@/db/schema";
import { eq } from "drizzle-orm";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function AgentPage({ params }: PageProps) {
  const agent = await db
    .select()
    .from(agents)
    .where(eq(agents.id, params.id))
    .then((rows) => rows[0]);

  if (!agent) {
    return <div className="p-4 text-red-500">Agent not found</div>;
  }

  return (
    <div className="p-4 space-y-2">
      <h1 className="text-xl font-bold">{agent.name || "Untitled Agent"}</h1>
      <p className="text-muted-foreground">{agent.instructions}</p>
    </div>
  );
}
