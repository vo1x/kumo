"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut, Loader2 } from "lucide-react";
import { FaGoogle } from "react-icons/fa";

import { signIn } from "next-auth/react";
export default function UserProfile() {
  const { status, data: session } = useSession();

  if (status === "unauthenticated")
    return (
      <button
        className="cursor-pointer absolute top-0 right-0 m-4 gap-2 shadow-xs flex items-center bg-white/10 backdrop-blur-sm p-2 rounded-md"
        onClick={() => signIn("google")}
      >
        <FaGoogle size={24}></FaGoogle>
        <span className="font-semibold x">Sign in with Google</span>
      </button>
    );

  if (status === "loading")
    return (
      <div className="absolute top-0 right-0 m-4 gap-4 flex items-center bg-white/10 backdrop-blur-sm p-2 rounded-md">
        <Loader2 size={32} className="animate-spin" />
      </div>
    );

  if (status === "authenticated")
    return (
      <div className="absolute top-0 right-0 m-4 gap-4 flex items-center bg-white/10 backdrop-blur-sm p-2 rounded-md">
        <div className="flex gap-2 items-center">
          <img
            src={session.user?.image || ""}
            alt="User avatar"
            className="rounded-full w-10 h-10"
          />
          <p className="font-semibold">{session.user?.name}</p>
        </div>
        <button onClick={() => signOut()} className=" cursor-pointer">
          <LogOut />
        </button>
      </div>
    );
}
