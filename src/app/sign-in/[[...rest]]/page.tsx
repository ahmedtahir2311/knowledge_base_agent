"use client";
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className='h-screen flex flex-col md:flex-row items-center justify-center bg-[#152022]'>
      <SignIn
        appearance={{}}
        signUpUrl='/register'
        fallbackRedirectUrl='/dashboard'
        routing='path'
        path='/sign-in'
      />
    </div>
  );
}
