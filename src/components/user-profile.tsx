import { auth } from "@/auth";
import { SignInButton, SignOutButton } from "@/components/auth";

export default async function UserProfile() {
  const session = await auth();
  if (!session?.user) return <SignInButton />;

  return (
    <div className="absolute top-0 right-0 m-4 gap-2 flex items-center bg-white/10 backdrop-blur-sm p-2 rounded-md">
      <div className="flex gap-2 items-center">
        <img
          src={session.user?.image || ""}
          alt="User avatar"
          className="rounded-full w-10 h-10"
        />
        <p className="font-semibold">{session.user?.name}</p>
      </div>
      <SignOutButton />
    </div>
  );
}
