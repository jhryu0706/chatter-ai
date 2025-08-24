import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <SidebarProvider className="p-4">
          <AppSidebar />
          <SidebarTrigger />
          <main className="w-full flex flex-col flex-1 overflow-auto">
            <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
