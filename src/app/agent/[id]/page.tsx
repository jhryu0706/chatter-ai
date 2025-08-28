import AgentButtonGroup from "@/components/agent/agent-button-group";
import AgentVoiceSample from "@/components/agent/voice-library";
import TestingAudio from "@/components/agent/agent-audio-sample";
import { SetBreadcrumb } from "@/components/home/breadcrumb-context";
import { db } from "@/db";
import { agents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function AgentPage({ params }: PageProps) {
  const id = params.id;
  const agent = await db
    .select()
    .from(agents)
    .where(eq(agents.id, id))
    .then((rows) => rows[0]);

  if (!agent) {
    redirect("/");
  }

  const agentName = agent.name || "Agent " + agent.id.slice(-4);

  return (
    <>
      <SetBreadcrumb label={agentName} href={`/agent/${agent.id}`} />
      <div className="flex items-center space-x-2" role="group">
        <h1 className="text-4xl font-bold">{agentName}</h1>
      </div>
      <p className="text-muted-foreground text-xl">
        Description: {agent.instructions}
      </p>
      <AgentButtonGroup agentId={`${agent.id}`} />
      <TestingAudio />
    </>
  );
}
