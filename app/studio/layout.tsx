import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import { createClient } from "../../lib/supabase/server";

export default async function StudioLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="flex min-h-screen">
        <DashboardSidebar />

        <div className="min-w-0 flex-1">
          <DashboardHeader />

          <main className="p-5 sm:p-7 lg:p-9">{children}</main>
        </div>
      </div>
    </div>
  );
}