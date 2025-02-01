"use client";

import { ChangeEvent, useState } from "react";
import { Header } from "./header";
import { Settings } from "./settings";

import {
  BookCopy,
  Tag,
  Hourglass,
  ClipboardCopy,
  CloudAlert,
} from "lucide-react";

import { extractId } from "@/lib/parser";

export const FileClone = () => {
  const [driveUrl, setDriveUrl] = useState<string | null>(null);
  const [destinationId, setDestinationId] = useState<string | null>(null);
  const [isCloned, setIsCloned] = useState(false);
  const [clonedItemUrl, setClonedItemUrl] = useState("");
  const [isCloning, setIsCloning] = useState(false);

  return (
    <div className="bg-white/10 relative flex flex-col gap-4 backdrop-blur-sm max-w-2xl w-max p-4 rounded-md">
      <Header />
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="bg-blue-100 p-2 w-96 outline-none rounded-sm text-blue-900 placeholder-[#2B7FFF] "
          placeholder="Enter a drive URL..."
          value={driveUrl ?? ""}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setDriveUrl(event.target.value)
          }
          disabled={isCloning}
        />
        <CloneButton
          driveUrl={driveUrl ?? ""}
          destId={destinationId ?? ""}
          setIsCloned={setIsCloned}
          setIsCloning={setIsCloning}
          isCloning={isCloning}
          setClonedItemUrl={setClonedItemUrl}
        />
      </div>
      {isCloning && (
        <div className="bg-yellow-100 rounded-md p-2 w-96 text-yellow-700 flex items-center gap-2">
          <Hourglass />
          <span>Cloning. Please wait...</span>
        </div>
      )}

      {!isCloning && isCloned && (
        <div className="bg-[#B9F8CF] rounded-md p-2 w-96 text-green-700 flex items-center gap-2">
          <ClipboardCopy />
          <span
            className="border-dashed border p-1 w-full rounded-md bg-[#C7F9D9] truncate cursor-pointer"
            onClick={(event) =>
              navigator.clipboard.writeText(event?.target.textContent)
            }
          >
            {clonedItemUrl}
          </span>
        </div>
      )}

      {!isCloning && !isCloned && (
        <div className="bg-red-100 rounded-md p-2 w-96 text-red-700 flex items-center gap-2">
          <CloudAlert />
          <span className="">Unable to clone item</span>
        </div>
      )}

      <Divider />
      <Settings
        setDestinationId={setDestinationId}
        destinationId={destinationId}
      />
    </div>
  );
};

const CloneButton = ({
  driveUrl,
  destId,
  setIsCloned,
  setIsCloning,
  isCloning,
  setClonedItemUrl,
}: {
  driveUrl: string;
  destId: string;
  setIsCloned: any;
  setIsCloning: any;
  isCloning: any;
  setClonedItemUrl: any;
}) => {
  const handleCloneButton = async () => {
    if (driveUrl === "") return;

    const mimeId = extractId(driveUrl);

    if (!mimeId) {
      console.error("Couldn't extract drive ID");
      return;
    }

    if (destId === "") return;
    try {
      setIsCloning(true);
      const res = await fetch(
        `/api/drive/clone?mimeId=${mimeId}&destId=${destId}`
      );

      const data = await res.json();
      if (data.success) {
        console.log(data.newFolder);
        setIsCloning(false);
        setClonedItemUrl(
          data.newFolder.mimeType !== "application/vnd.google-apps.folder"
            ? `https://drive.google.com/file/d/${data.newFolder.id}`
            : `https://drive.google.com/drive/u/1/folders/${data.newFolder.id}`
        );
        setIsCloned(true);
      }
    } catch (error) {
      setIsCloning(false);
      setIsCloned(false);
      return;
    }
  };
  return (
    <button onClick={handleCloneButton} disabled={isCloning}>
      <BookCopy
        size={28}
        className="bg-blue-100 cursor-pointer text-[#2B7FFF] w-8 h-auto rounded-md p-1 shadow-sm"
      />
    </button>
  );
};

const Divider = () => {
  return <div className="bg-white/25 h-0.5 rounded-md w-full" />;
};
