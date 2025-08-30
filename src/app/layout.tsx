import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/home/sidebar";
import { Inter } from "next/font/google";
import {
  BreadcrumbProvider,
  LayoutShell,
} from "@/components/home/breadcrumb-context";
import { loadOrInitSessionAuth } from "@/lib/sessionStore";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await loadOrInitSessionAuth();
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <SidebarProvider className="p-4">
          <AppSidebar />
          <SidebarTrigger />
          <main className="w-full flex flex-col flex-1 overflow-auto px-2">
            <BreadcrumbProvider>
              <LayoutShell />
              <div className="mx-auto w-full p-4 sm:px-6 lg:px-8 py-8 space-y-4">
                {children}
              </div>
            </BreadcrumbProvider>
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
