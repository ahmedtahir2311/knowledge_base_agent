"use client";

import React from "react";
import Link from "next/link";
import { SquarePlus } from "lucide-react";

interface LogoProps {
  isExpanded: boolean;
  className?: string;
}

const Logo = ({ isExpanded = true, className = "" }: LogoProps) => {
  return (
    <Link
      href='/'
      className={`flex items-center font-bold text-xl ${className}`}
    >
      <div className='mr-2 text-primary'>
        <SquarePlus size={28} className='transform -rotate-45' />
      </div>
      {isExpanded ? <span>Contract Q</span> : <></>}
    </Link>
  );
};

export default Logo;
