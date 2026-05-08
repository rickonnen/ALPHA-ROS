"use client";

import Banner from "@/components/homeComponents/banner";
import FilterPanel from "@/components/homeComponents/filterPanel";
import TopCities from "@/components/homeComponents/top-cities/TopCities";
import ExploreBy from "@/components/homeComponents/exploreBy";
import BlogSection from "@/components/homeComponents/blogSection";
import AdminRedirect from "./auth/AdminRedirect";
import { useAuth, isAdminUser } from "./auth/AuthContext";

export default function HomePage() {
  const { user: objUser, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (isAdminUser(objUser)) {
    return (
      <>
        <AdminRedirect />
        <div className="min-h-screen bg-background" />
      </>
    );
  }

  return (
    <>
      <AdminRedirect />
      <main className="flex min-h-screen flex-col items-center bg-background w-full overflow-x-hidden transition-colors duration-300">
        <section className="w-full">
          <Banner />
        </section>

        <section className="w-full px-4 py-6 sm:px-6 lg:px-10">
          <div className="mx-auto w-full max-w-6xl">
            <FilterPanel />
          </div>
        </section>

        <section className="w-full px-4 mt-16">
          <TopCities />
        </section>

        <section className="w-full max-w-6xl mx-auto px-4 mt-5">
          <ExploreBy />
        </section>

        <section className="w-full mx-auto px-4 mt-5">
          <BlogSection />
        </section>
      </main>
    </>
  );
}