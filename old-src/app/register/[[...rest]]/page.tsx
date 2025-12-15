"use client";
import { SignUp } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className='h-screen flex flex-col md:flex-row items-center justify-center bg-[#152022]'>
      <SignUp
        appearance={{}}
        signInUrl='/sign-in'
        afterSignOutUrl={"/sign-in"}
        fallbackRedirectUrl='/dashboard'
        routing='path'
        path='/register'
      />
    </div>
  );
}
