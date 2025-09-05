"use server";

import AgentButtonGroup from "@/components/agent/agent-button-group";
import { SetBreadcrumb } from "@/lib/ctx/breadcrumb-context";
import { redirect } from "next/navigation";
import AgentAudioSample from "@/components/agent/agent-audio-sample";
import ColorCard from "@/components/agent/color-card";
import { AgentProvider } from "@/lib/ctx/agent-context";
import {
  fetchOneAgent,
  getConversationsForAgent,
} from "@/lib/actions/agent-actions";
import ConversationsList from "@/components/conversation/conversations-list";
import { Conversation } from "@/components/conversation/request-conversation";

type PageProps = Readonly<{ params: { id: string } }>;

export default async function AgentPage({ params }: PageProps) {
  const id = params.id;
  const agent = await fetchOneAgent(id);

  if (!agent) {
    redirect("/");
  }

  const agentNameCleaned = agent.name || "Agent " + agent.id.slice(-4);

  const conv = await getConversationsForAgent(id);

  return (
    <AgentProvider agent={agent}>
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
          <div className="mx-auto flex flex-col md:flex-row items-center gap-6 overflow-hidden *:max-w-full *:font-medium">
            <ColorCard
              color="red"
              cardHeader="Step 1:"
              cardDescription="Check sample."
              backContent={<AgentAudioSample />}
            />
            <ColorCard
              color="blue"
              cardHeader="Step 2:"
              cardDescription="Call agent."
              backContent={<Conversation />}
            />
            <ColorCard
              color="yellow"
              cardHeader="Step 3:"
              cardDescription="Browse call history."
              backContent={<ConversationsList conversations={conv} />}
            />
          </div>
        </div>
      </div>
    </AgentProvider>
  );
}
