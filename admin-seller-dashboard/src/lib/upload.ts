/**
 * Upload a single file to Zaykaur backend.
 * Uses POST /api/v1/upload?folder=... with FormData and Bearer token.
 * Returns the uploaded file URL from response.data.url.
 */
import { getToken } from "@/helper/tokenHelper";
import { apiUrl } from "./api";

export type UploadFolder = "products" | "avatars" | "sellers" | "categories" | "documents" | "general";

export async function uploadFile(file: File, folder: UploadFolder = "products"): Promise<string> {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const formData = new FormData();
  formData.append("file", file);

  const url = `${apiUrl("/api/v1/upload")}?folder=${encodeURIComponent(folder)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let message = response.status === 404 ? "Upload endpoint not found. Is the API gateway running on the configured port?" : "Upload failed";
    try {
      const text = await response.text();
      const err = text ? JSON.parse(text) : null;
      if (err && typeof err.message === "string") message = err.message;
    } catch {
      // ignore non-JSON body
    }
    throw new Error(message);
  }

  let data: { data?: { url?: string }; message?: string };
  try {
    data = await response.json();
  } catch {
    throw new Error("Upload response was not valid JSON");
  }
  const fileUrl = data?.data?.url;
  if (!fileUrl) {
    throw new Error(data?.message || "Upload response missing URL");
  }
  return fileUrl;
}
