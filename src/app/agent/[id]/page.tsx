import AgentButtonGroup from "@/components/agent/agent-button-group";
import { SetBreadcrumb } from "@/lib/ctx/breadcrumb-context";
import { db } from "@/db";
import { agents, voices } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import AgentAudioSample from "@/components/agent/agent-audio-sample";
import { Conversation } from "@/components/audio/conversation";
import ColorCard from "@/components/agent/color-card";

type PageProps = {
  params: {
    id: string;
  };
};

export type AgentProps = {
  name: string | null;
  id: string;
  instructions: string;
  voiceId: string;
  voiceSampleInstructions: string | null;
  voiceName: string | null;
};

export default async function AgentPage({ params }: PageProps) {
  const id = params.id;
  const agent: AgentProps = await db
    .select({
      name: agents.name,
      id: agents.id,
      instructions: agents.instructions,
      voiceId: agents.voiceId,
      voiceSampleInstructions: agents.voiceSampleInstructions,
      voiceName: voices.name,
    })
    .from(agents)
    .leftJoin(voices, eq(agents.voiceId, voices.id))
    .where(eq(agents.id, id))
    .then((rows) => rows[0]);

  if (!agent) {
    redirect("/");
  }

  const agentNameCleaned = agent.name || "Agent " + agent.id.slice(-4);

  return (
    <>
      {/* setting breadcrumb */}
      <SetBreadcrumb label={agentNameCleaned} href={`/agent/${agent.id}`} />

      {/* agent name and some options (edit, delete) */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2" role="group">
          <h1 className="text-4xl font-bold">{agentNameCleaned}</h1>
        </div>
        <AgentButtonGroup agentId={`${agent.id}`} />
      </div>

      <div className="flex-row justify-center">
        <dl>
          <div className="rounded-sm bg-accent p-4 flex-col mb-20">
            <dt className="font-bold text-gray-500">Voice by:</dt>
            <dd>{agent.voiceName ?? "—"}</dd>
            <dt className="font-bold text-gray-500">Description:</dt>
            <dd>{agent.instructions}</dd>
          </div>
        </dl>

        <div className="flex">
          <div className="mx-auto sm:flex-row md:flex items-center gap-6">
            <ColorCard
              color="red"
              cardHeader="Step 1:"
              cardDescription="Check sample."
              backContent={<AgentAudioSample agentId={agent.id} />}
            />
            <ColorCard
              color="blue"
              cardHeader="Step 2:"
              cardDescription="Call agent."
              backContent={<Conversation agent={agent} />}
            />
            <ColorCard
              color="yellow"
              cardHeader="Step 3:"
              cardDescription="Browse call history."
            />
          </div>
        </div>
      </div>
    </>
  );
}
