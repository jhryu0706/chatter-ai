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
                agents.map((agent, index) => (
                  <SidebarMenuItem key={agent.id}>
                    <SidebarMenuButton asChild>
                      <a
                        href={`/agent/${agent.id}`}
                        className="py-2 h-full flex-col w-full items-start"
                      >
                        <span className="text-md text-black">
                          {agent.name || `Agent ${index + 1}`}
                        </span>
                        <span className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
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
