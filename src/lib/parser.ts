import { isGDriveId } from "./validate";

export const extractId: (url: string) => string | null = (url) => {
  if (isGDriveId(url)) {
    return url;
  }

  if (url.includes("folders") || url.includes("file")) {
    const re =
      /https:\/\/drive\.google\.com\/(?:drive(.*?)\/folders\/|file(.*?)?\/d\/)([-\w]+)/;
    const match = url.match(re);
    if (match) return match[3];
  }

  try {
    const driveUrl = new URL(url);
    return driveUrl.searchParams.get("id");
  } catch (error) {
    return null;
  }
};

export const getHumanReadableFileSize = (bytes: string) => {
  try {
    const pBytes = parseInt(bytes);
    const fileSizeUnits = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    if (pBytes === 0) return "0 B";
    if (isNaN(pBytes) || pBytes < 0) throw new Error("Invalid bytes value");
    const i = Math.floor(Math.log(pBytes) / Math.log(1024));
    const size = (pBytes / Math.pow(1024, i)).toFixed(2);
    return `${size} ${fileSizeUnits[i]}`;
  } catch (error) {
    return `${bytes} B`;
  }
};
