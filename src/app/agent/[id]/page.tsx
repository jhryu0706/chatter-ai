import AgentButtonGroup from "@/components/agent/agent-button-group";
import { SetBreadcrumb } from "@/components/home/breadcrumb-context";
import { db } from "@/db";
import { agents, voices } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import AgentAudioSample from "@/components/agent/agent-audio-sample";
import { Conversation } from "@/components/audio/conversation";

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

      <div className="mt-12 flex divide-x divide-gray-300">
        {/* Information section */}
        <div className="flex-1 pr-4 basis-1/3">
          <h1 className="text-2xl font-bold mb-4">Information</h1>
          <dl className="grid grid-cols-1 gap-y-2 text-lg text-muted-foreground">
            <div className="flex gap-2">
              <dt className="font-medium text-gray-500">Description:</dt>
              <dd>{agent.instructions}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-gray-500">Voice by:</dt>
              <dd>{agent.voiceName ?? "—"}</dd>
            </div>
            <AgentAudioSample agentId={agent.id} />
          </dl>
        </div>

        {/* Ring-ring! section */}
        <div className="flex basis-2/3 items-center justify-center">
          <div className="flex items-center space-x-2 mt-4" role="group">
            <Conversation agent={agent} />
          </div>
        </div>
      </div>
    </>
  );
}
