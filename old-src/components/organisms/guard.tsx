"use client";

import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface GuardProps {
  children: ReactNode;
  fallbackUrl?: string;
  loadingComponent?: ReactNode;
}

const Guard = ({
  children,
  loadingComponent = (
    <div className='flex items-center justify-center min-h-screen'>
      Loading...
    </div>
  ),
}: GuardProps) => {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn && !userId) {
      const redirectUrl = process.env.NEXT_PUBLIC_LOGIN_URL;
      router.push(`${redirectUrl}`);
    }
  }, [isSignedIn, isLoaded, userId, router]);

  if (!isLoaded) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1A2231]'></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default Guard;
