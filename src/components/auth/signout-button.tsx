import { signOut } from "@/auth";
import { LogOut } from "lucide-react";

export const SignOutButton = () => {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
      className="flex items-center"
    >
      <button type="submit" className=" cursor-pointer">
        <LogOut />
      </button>
    </form>
  );
};
