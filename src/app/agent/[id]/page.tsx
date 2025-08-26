import AgentButtonGroup from "@/components/agent/agent-button-group";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { agents } from "@/db/schema";
import { fetchOneAgent } from "@/lib/actions/agent-actions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function AgentPage({ params }: PageProps) {
  const id = params.id;
  const agent = await fetchOneAgent(id);

  if (!agent) {
    return redirect("/");
  }

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>{agent.name || "Agent"}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-2" role="group">
          <h1 className="text-4xl font-bold">
            {agent.name || `Agent ${agent.id.slice(-4)}`}
          </h1>
        </div>
        <p className="text-muted-foreground text-xl">
          Description: {agent.instructions}
        </p>
        <AgentButtonGroup agentId={`${agent.id}`} />
      </div>
    </>
  );
}
