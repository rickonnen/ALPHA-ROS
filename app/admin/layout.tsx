import type { Metadata } from "next";
import HeaderAdmin from "./headerAdmin";
import AdminGuard from "./AdminGuard";

export const metadata: Metadata = {
  title: "Panel Admin - Alpha Ros",
  description: "Panel de administración de Alpha Ros",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="min-h-screen bg-background text-foreground">
      <HeaderAdmin />

      <AdminGuard>
        <main className="mx-auto w-full max-w-[95%] px-2 sm:px-6 py-10">
          {children}
        </main>
      </AdminGuard>
    </section>
  );
}