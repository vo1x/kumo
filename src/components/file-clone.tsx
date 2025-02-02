"use client";
import { ChangeEvent, useState } from "react";
import { Header } from "./header";
import { Settings } from "./settings";
import { BookCopy, Hourglass, ClipboardCopy, CloudAlert } from "lucide-react";
import { extractId } from "@/lib/parser";
import { isGdriveUrl, isGDriveId } from "@/lib/validate";

type AppError = {
  message: string;
  type: "validation" | "api" | "unknown";
};

type AppStatus = {
  message: string;
  type: "cloning" | "cloned";
};

export const FileClone = () => {
  const [driveUrl, setDriveUrl] = useState<string | null>(null);
  const [destinationId, setDestinationId] = useState<string | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [appStatus, setAppStatus] = useState<AppStatus | null>(null);

  const handleInputField = (event: ChangeEvent<HTMLInputElement>) => {
    setDriveUrl(event.target.value);
    setError(null); 
    setAppStatus(null); 
  };

  return (
    <div className="bg-white/10 relative flex flex-col gap-4 backdrop-blur-sm max-w-2xl w-max p-4 rounded-md">
      <Header />
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="bg-blue-100 p-2 w-96 outline-none rounded-sm text-blue-900 placeholder-[#2B7FFF]"
          placeholder="Enter a drive URL..."
          value={driveUrl ?? ""}
          onChange={handleInputField}
          disabled={!!appStatus && appStatus.type === "cloning"} 
        />
        <CloneButton
          driveUrl={driveUrl ?? ""}
          destId={destinationId ?? ""}
          setAppStatus={setAppStatus}
          setError={setError}
          appStatus={appStatus}
        />
      </div>

      {appStatus?.type === "cloning" && (
        <div className="bg-yellow-100 rounded-md p-2 w-96 text-yellow-700 flex items-center gap-2">
          <Hourglass />
          <span>{appStatus.message}</span>
        </div>
      )}
      {appStatus?.type === "cloned" && (
        <div className="bg-[#B9F8CF] rounded-md p-2 w-96 text-green-700 flex items-center gap-2">
          <ClipboardCopy />
          <span
            className="border-dashed border p-1 w-full rounded-md bg-[#C7F9D9] truncate cursor-pointer"
            onClick={() => navigator.clipboard.writeText(appStatus.message)} // Copy the URL directly
          >
            {appStatus.message}
          </span>
        </div>
      )}
      {error && (
        <div className="bg-red-100 rounded-md p-2 w-96 text-red-700 flex items-center gap-2">
          <CloudAlert />
          <span>{error.message}</span>
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
  appStatus,
  setAppStatus,
  setError,
}: {
  driveUrl: string;
  destId: string;
  appStatus: AppStatus | null;
  setAppStatus: (status: AppStatus | null) => void;
  setError: (error: AppError | null) => void;
}) => {
  const handleCloneButton = async () => {
    try {
      if (!driveUrl.trim()) {
        setError({
          message: "Please enter a valid Drive URL or ID",
          type: "validation",
        });
        return;
      }
      if (!isGDriveId(driveUrl) && !isGdriveUrl(driveUrl)) {
        setError({ message: "Invalid Drive URL or ID", type: "validation" });
        return;
      }

      if (!destId.trim()) {
        setError({
          message: "Please provide a valid destination folder ID",
          type: "validation",
        });
        return;
      }

      const mimeId = extractId(driveUrl);
      if (!mimeId) {
        setError({
          message: "Failed to extract Drive ID from the provided URL",
          type: "validation",
        });
        return;
      }

      setAppStatus({
        message: "Cloning. Please wait...",
        type: "cloning",
      });
      setError(null); 

      const res = await fetch(
        `/api/drive/clone?mimeId=${mimeId}&destId=${destId}`
      );
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to clone item");
      }

      const newItemUrl =
        data.newFolder.mimeType !== "application/vnd.google-apps.folder"
          ? `https://drive.google.com/file/d/${data.newFolder.id}`
          : `https://drive.google.com/drive/u/1/folders/${data.newFolder.id}`;

      setAppStatus({
        message: newItemUrl,
        type: "cloned",
      });
    } catch (err: any) {
      setError({
        message: err.message || "An unexpected error occurred",
        type: "api",
      });
      setAppStatus(null); 
    }
  };

  return (
    <button
      onClick={handleCloneButton}
      disabled={!!appStatus && appStatus.type === "cloning"}
    >
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
