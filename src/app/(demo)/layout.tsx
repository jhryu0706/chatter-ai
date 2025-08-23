import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { loadOrInitSession } from "@/lib/sessionStore";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await loadOrInitSession();
  return (
    <SidebarProvider className="p-4">
      <AppSidebar />
      <SidebarTrigger />
      <main className="w-full flex flex-col flex-1 overflow-auto">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
