import React from "react";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  useSidebar,
} from "./ui/sidebar";
import { usePathname } from "next/navigation";
import {
  Building,
  FileCheck,
  Heart,
  Home,
  Menu,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import { cn } from "@/lib/utils";

const AppSidebar = ({ userType }: { userType: "manager" | "tenant" }) => {
  const pathname = usePathname();
  const { open, toggleSidebar } = useSidebar();

  const navItems =
    userType === "manager"
      ? [
          {
            href: "/managers/properties",
            icon: Building,
            label: "Properties",
          },
          {
            href: "/managers/applications",
            icon: FileCheck,
            label: "Applications",
          },
          {
            href: "/managers/settings",
            icon: Settings,
            label: "Settings",
          },
        ]
      : [
          {
            href: "/tenants/favorites",
            icon: Heart,
            label: "Favorites",
          },
          {
            href: "/tenants/applications",
            icon: FileCheck,
            label: "Applications",
          },
          {
            href: "/tenants/residences",
            icon: Home,
            label: "Residences",
          },
          {
            href: "/tenants/settings",
            icon: Settings,
            label: "Settings",
          },
        ];
  return (
    <Sidebar
      collapsible="icon"
      className="fixed left-0 bg-white shadow-lg"
      style={{ top: NAVBAR_HEIGHT, height: `calc(100vh - ${NAVBAR_HEIGHT}px)` }}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div
              className={cn(
                "flex min-h-[56px] w-full items-center justify-center pt-3 mb-3 transition-all duration-200",
                open ? "justify-between px-6" : "justify-center"
              )}
            >
              <h1
                className={cn(
                  "text-2xl font-bold text-gray-800 transition-all duration-200",
                  open ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
                )}
              >
                {userType === "manager" ? "Manager" : "Tenant"}
              </h1>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
              >
                {open ? (
                  <X className="h-6 w-6 mt-1.5 text-gray-600 transition-transform duration-200" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-600 transition-transform duration-200" />
                )}
              </button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={cn(
                    "flex items-center px-7 py-7",
                    isActive
                      ? "bg-gray-100"
                      : "text-gray-600 hover:bg-gray-100",
                    open ? "text-blue-600" : "ml-[5px]"
                  )}
                  tooltip={item.label}
                >
                  <Link
                    href={item.href}
                    className="w-full flex items-center gap-3"
                    scroll={false}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-colors duration-200",
                        isActive ? "text-blue-600" : "text-gray-600"
                      )}
                    />
                    <span
                      className={cn(
                        "truncate transition-all duration-200",
                        isActive ? "text-blue-600" : "text-gray-600",
                        open
                          ? "opacity-100 w-auto"
                          : "opacity-0 w-0 overflow-hidden"
                      )}
                    >
                      {item.label}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
