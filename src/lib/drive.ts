const MAX_CONCURRENT_REQUESTS = 5;
const BASE_URL = "https://www.googleapis.com/drive/v3/files";

export const delay = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

async function fetchWithRetry(url, options, retries = 3, delayMs = 1000) {
  for (let i = 0; i < retries; i++) {
    console.log(`Fetching: ${url} (Attempt ${i + 1}/${retries})`);
    const response = await fetch(url, options);

    if (response.ok) return response.json();

    const responseText = await response.text();
    console.warn(
      `Retrying request (${i + 1}/${retries})... Status: ${response.status} ${
        response.statusText
      }\nResponse: ${responseText}`
    );

    await delay(delayMs * Math.pow(2, i));
  }
  throw new Error("Failed after multiple retries");
}

async function getHeaders(session) {
  return {
    Authorization: `Bearer ${session.accessToken}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

async function getFolderContents(session, folderId) {
  let files = [];
  let pageToken = null;

  do {
    const url = `${BASE_URL}?q='${folderId}'+in+parents&fields=files(id,name,mimeType),nextPageToken&includeItemsFromAllDrives=true&supportsAllDrives=true`;
    const response = await fetchWithRetry(url, {
      headers: await getHeaders(session),
    });
    files.push(...response.files);
    pageToken = response.nextPageToken || null;
  } while (pageToken);

  return files;
}

export async function createFolder(session, name, parentFolderId) {
  const url = BASE_URL;
  const body = {
    name,
    mimeType: "application/vnd.google-apps.folder",
    parents: [parentFolderId],
  };

  console.log(`Creating folder: ${name} in ${parentFolderId}`);
  return await fetchWithRetry(url, {
    method: "POST",
    headers: await getHeaders(session),
    body: JSON.stringify(body),
  });
}

async function copyFolderContents(
  session,
  sourceFolderId,
  destinationFolderId
) {
  console.log(
    `Copying contents of folder: ${sourceFolderId} to ${destinationFolderId}`
  );
  const files = await getFolderContents(session, sourceFolderId);
  const queue = [...files];
  const tasks = [];

  while (queue.length > 0) {
    while (tasks.length < MAX_CONCURRENT_REQUESTS && queue.length > 0) {
      const file = queue.shift();
      const task = (async () => {
        if (file.mimeType === "application/vnd.google-apps.folder") {
          console.log(
            `Creating subfolder: ${file.name} in ${destinationFolderId}`
          );
          const newFolder = await createFolder(
            session,
            file.name,
            destinationFolderId
          );
          await copyFolderContents(session, file.id, newFolder.id);
        } else {
          console.log(`Copying file: ${file.name} to ${destinationFolderId}`);
          await copyFile(session, file.id, destinationFolderId);
        }
      })();
      tasks.push(task);
    }
    await Promise.all(tasks);
    tasks.length = 0;
  }
}

export async function copyFile(
  session,
  fileId: string,
  destinationFolderId: string
) {
  const url = `${BASE_URL}/${fileId}/copy?supportsAllDrives=true`;
  const body = { parents: [destinationFolderId] };
  console.log(`Copying file ${fileId} to folder ${destinationFolderId}`);

  return await fetchWithRetry(url, {
    method: "POST",
    headers: await getHeaders(session),
    body: JSON.stringify(body),
  });
}

export async function cloneFolder(
  session,
  sourceFolderId,
  destinationFolderId
) {
  console.log(`Cloning folder: ${sourceFolderId} to ${destinationFolderId}`);
  const sourceFolder = await fetchWithRetry(
    `${BASE_URL}/${sourceFolderId}?fields=id,name,mimeType&supportsAllDrives=true`,
    { headers: await getHeaders(session) }
  );

  if (sourceFolder.mimeType !== "application/vnd.google-apps.folder") {
    console.log(`Source is a file. Copying instead.`);
    return await copyFile(session, sourceFolderId, destinationFolderId);
  }

  console.log(
    `Creating root folder: ${sourceFolder.name} in ${destinationFolderId}`
  );
  const newFolder = await createFolder(
    session,
    sourceFolder.name,
    destinationFolderId
  );
  await copyFolderContents(session, sourceFolderId, newFolder.id);
  return newFolder;
}

export async function refreshAccessToken(refreshToken: string) {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.AUTH_GOOGLE_CLIENT_ID!,
        client_secret: process.env.AUTH_GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    const tokens = await response.json();

    if (!response.ok) {
      console.error("❌ Failed to refresh token:", tokens);
      throw tokens;
    }

    const expiresAt = Date.now() + tokens.expires_in * 1000;

    return {
      accessToken: tokens.access_token,
      expiresAt,
    };
  } catch (error) {
    console.error("🚨 Error refreshing access token:", error);
    return null;
  }
}
