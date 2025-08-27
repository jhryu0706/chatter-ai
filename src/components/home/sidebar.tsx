import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { fetchAgents } from "@/lib/actions/agent-actions";

export async function AppSidebar() {
  const agents = await fetchAgents();

  return (
    <Sidebar>
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg">All Agents</SidebarGroupLabel>
          <SidebarGroupContent className="py-4">
            <SidebarMenu>
              {agents &&
                agents.map((agent) => (
                  <SidebarMenuItem key={agent.id}>
                    <SidebarMenuButton
                      asChild
                      className="h-auto p-0 overflow-visible"
                    >
                      <a
                        href={`/agent/${agent.id}`}
                        className="flex w-full flex-col items-start px-2 py-2"
                      >
                        <span className="text-md text-black">
                          {agent.name || `Agent ${agent.id.slice(-4)}`}
                        </span>
                        <span className="text-sm text-muted-foreground mt-1 break-words w-full">
                          {agent.instructions}
                        </span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
