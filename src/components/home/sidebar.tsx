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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { fetchAgents } from "@/lib/actions/agent-actions";
import { group } from "node:console";

export async function AppSidebar() {
  const agents = await fetchAgents();

  const sidebarStyles = {
    groupLabel: "text-lg",
    groupContent: "py-4",
    sidebarMenuButton: "h-auto p-0 overflow-visible",
    sidebarA: "flex w-full flex-col items-start px-2 py-2",
    siebarHeader: "text-md text-black",
    sidebarSubHeader: "text-sm text-muted-foreground mt-1 break-words w-full",
  };
  return (
    <Sidebar>
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className={sidebarStyles.groupLabel}>
            Resources
          </SidebarGroupLabel>
          <SidebarContent className={sidebarStyles.groupContent}>
            <SidebarMenu>
              <SidebarMenuItem key="resource-page">
                <SidebarMenuButton
                  asChild
                  className={sidebarStyles.sidebarMenuButton}
                >
                  <a
                    href="/resources/voices"
                    className={sidebarStyles.sidebarA}
                  >
                    <span className={sidebarStyles.siebarHeader}>Voices</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel className={sidebarStyles.groupLabel}>
            All Agents
          </SidebarGroupLabel>
          <SidebarGroupContent className={sidebarStyles.groupContent}>
            <SidebarMenu>
              {agents &&
                agents.map((agent) => (
                  <SidebarMenuItem key={agent.id}>
                    <SidebarMenuButton
                      asChild
                      className={sidebarStyles.sidebarMenuButton}
                    >
                      <a
                        href={`/agent/${agent.id}`}
                        className="flex w-full flex-col items-start px-2 py-2"
                      >
                        <span className={sidebarStyles.siebarHeader}>
                          {agent.name || `Agent ${agent.id.slice(-4)}`}
                        </span>
                        <span className={sidebarStyles.sidebarSubHeader}>
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
