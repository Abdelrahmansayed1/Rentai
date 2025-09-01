"use client";

import Navbar from "@/components/navbar";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import React from "react";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { useGetAuthUserQuery } from "@/state/api";
import AppSidebar from "@/components/sidebar";
import { cn } from "@/lib/utils";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar();
  const { data: authUser } = useGetAuthUserQuery();

  return (
    <div className="min-h-screen w-full bg-primary-100">
      <Navbar />
      <div style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
        <main className="flex">
          <AppSidebar
            userType={
              authUser?.userInfo?.role?.toLowerCase() as "manager" | "tenant"
            }
          />
          <div
            className={cn(
              "flex-grow transition-all duration-200 ease-in-out",
              open ? "md:ml-48" : "md:ml-24"
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}
