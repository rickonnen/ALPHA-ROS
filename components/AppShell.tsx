"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/homeComponents/header";
import Footer from "@/components/homeComponents/footer";
import ExchangeRateBubble from "@/components/homeComponents/exchangeRateBubble";
import { GlobalShortcut } from "@/components/GlobalShortcut";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const strPathname = usePathname();
  const [bolIsMounted, setBolIsMounted] = useState(false);

  useEffect(() => {
    setBolIsMounted(true);
  }, []);

  const bolIsAdminRoute = strPathname?.startsWith("/admin") ?? false;

  if (!bolIsMounted) {
    return null;
  }

  if (bolIsAdminRoute) {
    return (
      <main className="min-h-screen flex-1 bg-background text-foreground">
        {children}
      </main>
    );
  }

  return (
    <>
      {/* El Header es fixed, por eso se compensa con pt-18 en el main */}
      <Header />

      <GlobalShortcut />

      <main className="flex-1 pt-18 flex flex-col">
        {children}
      </main>

      <Footer />

      <ExchangeRateBubble />
    </>
  );
}