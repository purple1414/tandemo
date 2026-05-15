import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { ModalProvider } from "@/components/layout/ModalProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SyncProvider } from "@/components/auth/SyncProvider";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tandemo AI | Your Financial Operating System",
  description: "Advanced shared financial management for couples.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-background`}>
        <AuthProvider>
          <SyncProvider>
            <ModalProvider>
              <LayoutShell>
                {children}
              </LayoutShell>
            </ModalProvider>
          </SyncProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
