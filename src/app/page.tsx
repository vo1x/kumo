import { FileClone } from "@/components/file-clone";
import UserProfile from "@/components/user-profile";

export default function Home() {
  return (
    <div className=" relative min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 min-w-screen overflow-hidden items-center flex justify-center">
      <UserProfile />
      <FileClone />
    </div>
  );
}
