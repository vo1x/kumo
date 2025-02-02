import { signIn } from "@/auth";
import { FaGoogle } from "react-icons/fa";

export const SignInButton = () => {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google");
      }}
    >
      <button
        type="submit"
        className="cursor-pointer absolute top-0 right-0 m-4 gap-2 shadow-xs flex items-center bg-white/10 backdrop-blur-sm p-2 rounded-md"
      >
        <FaGoogle size={24}></FaGoogle>
        <span className="font-semibold x">Sign in with Google</span>
      </button>
    </form>
  );
};
