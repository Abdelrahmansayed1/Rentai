"use client";

import { NAVBAR_HEIGHT } from "@/lib/constants";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import "../app/globals.css";
import { Button } from "./ui/button";
import { useGetAuthUserQuery } from "@/state/api";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";
import { Bell, MessageCircle, PlusIcon, SearchIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { SidebarTrigger } from "./ui/sidebar";

const NavBar = () => {
  const { data: authUser, isLoading } = useGetAuthUserQuery();
  const router = useRouter();
  const pathname = usePathname();
  const isDashboardPath =
    pathname.includes("/managers") || pathname.includes("/tenants");

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <div
      className="fixed top-0 left-0 w-full z-50 shadow-xl"
      style={{
        height: NAVBAR_HEIGHT,
      }}
    >
      <div className="flex items-center justify-between py-3 px-8 bg-primary-700 text-white">
        <div className="flex items-center gap-4 md:gap-6">
          {isDashboardPath && (
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
          )}
          <Link href="/" className="cursor-pointer" scroll={false}>
            <div className="flex items-center gap-4 md:gap-4">
              <Image
                src="/logo.svg"
                alt="Rentiful logo"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="flex items-center gap-0">
                <div className="text-xl font-bold hover:!text-primary-300">
                  RENT
                </div>
                <div className="text-xl text-secondary-500 font-light hover:!text-secondary-300">
                  AI
                </div>
              </div>
            </div>
          </Link>
          {isDashboardPath && (
            <Button
              variant="secondary"
              className="md:ml-4 bg-primary-50 text-primary-700 hover:bg-primary-500 hover:text-primary-50"
              onClick={() =>
                router.push(
                  authUser?.userInfo.role.toLowerCase() === "manager"
                    ? "/managers/newproperty"
                    : "/search"
                )
              }
            >
              {authUser?.userInfo?.role?.toLowerCase() === "manager" ? (
                <>
                  <PlusIcon className="w-4 h-4" />
                  <span className="hidden md:block ml-2">Add new property</span>
                </>
              ) : (
                <>
                  <SearchIcon className="w-4 h-4" />
                  <span className="hidden md:block ml-2">
                    Search Properties
                  </span>
                </>
              )}
            </Button>
          )}
        </div>
        {!isDashboardPath && (
          <p className="text-primary-200 hidden md:block">
            Discover a world of unlimited possibilities with our advanced search
          </p>
        )}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <Skeleton className="w-10 h-10 rounded-full" />
          ) : authUser ? (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="hidden md:block relative">
                  <MessageCircle className="w-6 h-6 text-primary-200 cursor-pointer hover:text-primary-400" />
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-2 h-2 flex items-center justify-center"></span>
                </div>
                <div className="hidden md:block relative">
                  <Bell className="w-6 h-6 text-primary-200 cursor-pointer hover:text-primary-400" />
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-2 h-2 flex items-center justify-center"></span>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none">
                  <Avatar>
                    <AvatarImage src={authUser.userInfo?.image} />
                    <AvatarFallback className="bg-primary-600">
                      {authUser.userInfo?.name?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-primary-200 hidden md:block">
                    {authUser.userInfo?.name}
                  </p>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white text-primary-700">
                  <DropdownMenuItem
                    className="cursor-pointer hover:!bg-primary-700 hover:!text-primary-100 font-bold"
                    onClick={() =>
                      router.push(
                        authUser.userRole?.toLowerCase() === "manager"
                          ? "/managers/properties"
                          : "/tenants/favorites",
                        { scroll: false }
                      )
                    }
                  >
                    Go to Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-primary-200" />
                  <DropdownMenuItem
                    className="cursor-pointer hover:!bg-primary-700 hover:!text-primary-100"
                    onClick={() =>
                      router.push(
                        `/${authUser.userRole?.toLowerCase()}s/settings`,
                        { scroll: false }
                      )
                    }
                  >
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer hover:!bg-primary-700 hover:!text-primary-100"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Link href="/signin">
                <Button
                  variant="outline"
                  className="text-white border-white bg-transparent hover:bg-white hover:text-primary-700 rounded-lg"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  variant="outline"
                  className="text-white border-white bg-secondary-500 hover:bg-white hover:text-primary-700 rounded-lg"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBar;
