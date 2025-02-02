import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  const destId: string | null = request.nextUrl.searchParams.get("destId");
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  if (!destId) {
    return NextResponse.json(
      { message: "destId query parameter is missing." },
      { status: 400 }
    );
  }

  const url = `https://www.googleapis.com/drive/v3/files/${destId}?fields=id,name,mimeType,permissions`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.user.accessToken}`,
    },
  });

  const data = await res.json();

  if (data.error) {
    return NextResponse.json(
      {
        message: `User can't access the provided destId: ${destId}`,
        isAccessible: false,
        error: data.error,
      },
      { status: 403 }
    );
  }

  const isFolder = data.mimeType === "application/vnd.google-apps.folder";

  return NextResponse.json(
    {
      message: `User can access the provided destId: ${destId}`,
      isAccessible: true,
      isFolder: isFolder,
      name: data.name,
      mimeType: data.mimeType,
    },
    { status: 200 }
  );
}
