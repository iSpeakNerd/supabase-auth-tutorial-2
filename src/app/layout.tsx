import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Header from "@/components/Header";
import { SupabaseProvider } from "@/auth/SupabaseProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Supabase Auth Tutorial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SupabaseProvider>
          <div className="flex flex-col min-h-screen justify-center items-center">
            <Header />
            {children}
          </div>

          <Toaster
            toastOptions={{
              style: {
                textAlign: "center",
              },
            }}
          />
        </SupabaseProvider>
      </body>
    </html>
  );
}
