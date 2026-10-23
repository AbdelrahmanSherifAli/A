import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";

export const metadata: Metadata = {
  title: "Our Story — Private Couple Sanctuary",
  description: "Our private little universe. A private sanctuary to preserve memories, letters, and moments together.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>❤️</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen text-[#F3F4F6] selection:bg-[#D4A853]/30 selection:text-white antialiased">
        <AuthProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
