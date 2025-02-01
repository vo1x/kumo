"use client";

import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
} from "react";
import { Edit, X, Loader2, Save } from "lucide-react";
import { isGDriveId } from "@/lib/validate";

export const Settings = ({ destinationId, setDestinationId }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isIdValid, setIsIdValid] = useState<boolean | null>(false);

  const [isValidating, setIsValidating] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const destinationId = window.localStorage.getItem("destinationId");
      setDestinationId(destinationId ?? null);
      setIsIdValid(destinationId ? isGDriveId(destinationId) : null);
    }
  }, []);

  return (
    <div className="flex flex-col space-y-2">
      <span className="font-semibold">Destination ID</span>
      <div className="flex items-center gap-2">
        <input
          type="text"
          className={`${
            isEditing
              ? isIdValid
                ? "bg-blue-100 placeholder-[#2B7FFF]"
                : "bg-red-100 text-red-700"
              : "bg-blue-300 cursor-not-allowed "
          } p-2 w-80 outline-none rounded-sm text-blue-900`}
          placeholder="Enter a destination ID"
          disabled={!isEditing || isValidating}
          value={destinationId || ""}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setDestinationId(e.target.value)
          }
        />
        {isEditing ? (
          <div className="flex items-center gap-2">
            <SaveButton
              setIsEditing={setIsEditing}
              setIsIdValid={setIsIdValid}
              setIsValidating={setIsValidating}
              isValidating={isValidating}
              destinationId={destinationId}
            />
            <button
              className="cursor-pointer"
              onClick={() => {
                setIsEditing(false);
                setIsValidating(false);
              }}
            >
              <X />
            </button>
          </div>
        ) : (
          <EditButton setIsEditing={setIsEditing} />
        )}
      </div>
    </div>
  );
};

const EditButton = ({
  setIsEditing,
}: {
  setIsEditing: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <button className="cursor-pointer" onClick={() => setIsEditing(true)}>
      <Edit />
    </button>
  );
};

const SaveButton = ({
  setIsEditing,
  setIsValidating,
  isValidating,
  setIsIdValid,
  destinationId,
}: {
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  setIsValidating: Dispatch<SetStateAction<boolean>>;
  setIsIdValid: Dispatch<SetStateAction<boolean | null>>;
  isValidating: boolean;
  destinationId: string | null;
}) => {
  const handleSaveButton = async () => {
    if (!destinationId) return;

    if (!isGDriveId(destinationId)) {
      setIsIdValid(false);
      setIsValidating(false);
      return;
    }

    try {
      setIsValidating(true);
      const res = await fetch(`/api/drive/validate?destId=${destinationId}`);
      const data = await res.json();

      if (data.isAccessible && data.isFolder) {
        setIsIdValid(true);
        setIsEditing(false);
        setIsValidating(false);
        window.localStorage.setItem("destinationId", destinationId);
      } else {
        setIsIdValid(false);
        setIsValidating(false);
      }
    } catch (error) {
      console.log(error);
      setIsValidating(false);
    }
  };

  return (
    <button className="cursor-pointer" onClick={handleSaveButton}>
      {isValidating ? <Loader2 className={"animate-spin"} /> : <Save />}
    </button>
  );
};
