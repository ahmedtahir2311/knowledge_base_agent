"use client";

import Link from "next/link";
import { ReactNode, useCallback } from "react";
import Tooltip from "@/components/atoms/tool-tip";
import { usePathname } from "next/navigation";

interface MenuItemProps {
  icon: ReactNode;
  text: string;
  href: string;
  isOpen: boolean;
}

export default function MenuItem({ icon, text, href, isOpen }: MenuItemProps) {
  const pathname = usePathname();
  const isActive = [href].includes(pathname);
  const isAnchorLink = href.startsWith("#") || false;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isAnchorLink) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    },
    [href, isAnchorLink]
  );

  const linkContent = (
    <>
      <div className='flex-shrink-0'>{icon}</div>
      {isOpen && <span className='truncate text-base font-medium'>{text}</span>}
    </>
  );

  return isOpen ? (
    <Link
      href={href}
      onClick={handleClick}
      className={`flex items-center gap-3 p-2 px-4 rounded-lg  hover:bg-[var(--color-secondary)] hover:text-secondary ${
        isActive && "bg-[var(--color-secondary)] text-primary"
      }`}
    >
      {linkContent}
    </Link>
  ) : (
    // <Tooltip content={text} position='right'>
    <Link
      href={href}
      onClick={handleClick}
      className={`flex items-center justify-center p-2 rounded-lg hover:bg-[var(--color-secondary)] hover:text-secondary ${
        isActive && "bg-[var(--color-secondary)] text-primary"
      }`}
    >
      {linkContent}
    </Link>
    // </Tooltip>
  );
}
