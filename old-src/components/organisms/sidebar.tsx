"use client";

import { ChevronRight, LayoutDashboard } from "lucide-react";
import { useSidebar } from "@/lib/context/sidebar-context";
import Logo from "@/components/atoms/Logo";
import SidebarToggle from "@/components/atoms/sidebar-toggle";
import MenuItem from "@/components/atoms/menu-item";
import { UserButton, useUser, useClerk } from "@clerk/nextjs";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = "" }: SidebarProps) {
  const { isOpen, toggle } = useSidebar();
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleUserProfileClick = () => {
    // Open the user profile dropdown
    document.querySelector<HTMLElement>(".cl-userButtonTrigger")?.click();
  };

  return (
    <div
      className={`relative h-screen bg-background shadow-2xl transition-layout z-30 ${
        isOpen ? "w-[20vw]" : "w-[5vw]"
      } ${className}`}
      style={{
        //   border: "0.5px solid #1b1b1b",
        boxShadow: "0px 0px 4px 0px #1b1b1b",
      }}
    >
      {/* Sidebar content container - using flex to create 3 sections */}
      <div className='h-full flex flex-col justify-between py-6'>
        {/* Top section - Logo */}
        <div className={`${isOpen ? "px-5" : "px-3"}`}>
          <Logo isExpanded={isOpen} />
        </div>

        {/* Divider line */}

        {/* Middle section - Menu Items */}
        <nav className={`flex-grow mt-16 ${isOpen ? "px-5" : "px-3"}`}>
          <ul className='space-y-2'>
            {menuItems.map((x) => {
              return (
                <li key={x.name}>
                  <MenuItem
                    icon={x.icon}
                    text={x.name}
                    href={x.href}
                    isOpen={isOpen}
                  />
                </li>
              );
            })}
          </ul>
          <div className={`mx-auto w-full ${isOpen ? "px-5" : "px-3"} my-4`}>
            <div className='h-px bg-primary opacity-20'></div>
          </div>
        </nav>

        {/* Divider line */}
        <div className={`mx-auto w-full ${isOpen ? "px-5" : "px-3"} mb-4`}>
          <div className='h-px bg-primary opacity-20'></div>
        </div>

        {/* Bottom section - User Profile */}
        <div className={`${isOpen ? "px-5" : "px-3"}`}>
          <div
            className='flex items-center cursor-pointer rounded-lg p-2 transition-colors'
            onClick={handleUserProfileClick}
          >
            <div
              className='relative'
              style={{
                width: isOpen ? "40px" : "32px",
                height: isOpen ? "40px" : "32px",
              }}
            >
              <div className='absolute opacity-0 pointer-events-none'>
                <UserButton afterSignOutUrl='/sign-in' />
              </div>
              {user?.imageUrl && (
                <img
                  src={user.imageUrl}
                  alt='Profile'
                  className='rounded-full object-cover w-full h-full'
                />
              )}
            </div>
            {isOpen && user && (
              <div className='ml-3 flex-grow'>
                <p className='font-medium text-sm'>Welcome back 👋</p>
                <p className='text-sm font-semibold'>
                  {user.firstName ||
                    user.username ||
                    user.emailAddresses[0].emailAddress.split("@")[0]}
                </p>
              </div>
            )}
            {isOpen && <ChevronRight size={16} className='text-gray-400' />}
          </div>
        </div>
      </div>

      {/* Toggle button */}
      <SidebarToggle
        isOpen={isOpen}
        onClick={toggle}
        className='top-[50px] -translate-y-1/2'
      />
    </div>
  );
}

const menuItems = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={22} />,
    href: "/dashboard",
  },
];
