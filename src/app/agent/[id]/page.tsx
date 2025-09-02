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
            <div className="w-[22vmax] aspect-square bg-red-500/30 hover:bg-red-500 transition-colors duration-200 flex flex-col justify-end p-6 text-white font-extrabold">
              <h1 className=" text-3xl text-white">Step 1:</h1>
              <p className="text-xl">Check Sample</p>
            </div>
            <div className="w-[22vmax] aspect-square bg-blue-600/30 hover:bg-blue-600 transition-colors duration-200" />
            <div className="w-[22vmax] aspect-square bg-yellow-300/30 hover:bg-yellow-300 transition-colors duration-200" />
          </div>
        </div>

        {/* <h1 className="text-2xl font-bold">Do this first:</h1>
        <AgentAudioSample agentId={agent.id} />
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2 mt-4" role="group">
            <Conversation agent={agent} />
          </div>
        </div> */}
      </div>
    </>
  );
}
