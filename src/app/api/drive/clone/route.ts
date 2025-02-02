import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
import { cloneFolder } from "@/lib/drive";
// import { authOptions } from "@/lib/authOptions";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  const mimeId: string | null = request.nextUrl.searchParams.get("mimeId");
  const destId: string | null = request.nextUrl.searchParams.get("destId");
  const session = await auth();

  console.log(mimeId);
  console.log(destId);
  console.log(session);

  if (!session) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  if (!mimeId) {
    return NextResponse.json(
      { message: "mimeId query parameter is missing." },
      { status: 400 }
    );
  }

  if (!destId) {
    return NextResponse.json(
      { message: "destId query parameter is missing." },
      { status: 400 }
    );
  }

  const newFolder = await cloneFolder(session.user, mimeId, destId);
  if (!newFolder) {
    return NextResponse.json(
      {
        message: `Couldn't clone`,
        success: false,
      },
      { status: 403 }
    );
  }

  return NextResponse.json(
    {
      message: `Item cloned successfully`,
      success: true,
      newFolder,
    },
    { status: 200 }
  );
}
