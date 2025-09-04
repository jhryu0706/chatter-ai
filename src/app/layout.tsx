import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/home/sidebar";
import { Inter } from "next/font/google";
import { BreadcrumbProvider, LayoutShell } from "@/lib/ctx/breadcrumb-context";
import { getOrCreateUserInDB, getSessionFromCookies } from "@/lib/sessionStore";
import { Metadata } from "next";
import { UserProvider } from "@/lib/ctx/user-context";
import { uploadVoices } from "@/lib/elevenlabs/elevenlabs-actions";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "chatter-ai",
  description: "chat with anything",
  icons: {
    icon: "/favicon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // this is really just for when there is a new db setup and you need to pull the voice library
  await uploadVoices();

  // moving auth step here
  const userId = await getSessionFromCookies();
  if (!userId) {
    throw new Error("Unauthorized: Missing session identifier.");
  }
  await getOrCreateUserInDB(userId);

  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <UserProvider userId={userId}>
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
        </UserProvider>
      </body>
    </html>
  );
}
