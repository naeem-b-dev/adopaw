import * as FileSystem from "expo-file-system";
import { supabase } from "./client";


/**
 * Uploads an image to Supabase storage using Expo FileSystem
 * @param {string} imageUri - The URI of the image to upload
 * @param {string} bucketName - The name of the Supabase storage bucket
 * @returns {Promise<{signedUrl: string, path: string}>} - Returns the signed URL and file path
 */
export const uploadImageToSupabase = async (imageUri, bucketName) => {
  if (!imageUri) {
    throw new Error("Image URI is required");
  }

  if (!bucketName) {
    throw new Error("Bucket name is required");
  }

  try {
    // Generate a unique filename
    const fileExtension = imageUri.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const filePath = `${fileName}`;

    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to ArrayBuffer
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const arrayBuffer = new Uint8Array(byteNumbers).buffer;

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, arrayBuffer, {
        contentType: `image/${fileExtension === "jpg" ? "jpeg" : fileExtension}`,
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    if (!publicUrlData?.publicUrl) {
      throw new Error("Failed to get public URL for uploaded image");
    }

    // Create a signed URL (optional, use if you need temporary access)
    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from(bucketName)
        .createSignedUrl(data.path, 60 * 60 * 24 * 365); // 1 year expiry

    if (signedUrlError) {
      console.warn("Could not create signed URL:", signedUrlError);
      // Return public URL as fallback
      return {
        signedUrl: publicUrlData.publicUrl,
        path: data.path,
        publicUrl: publicUrlData.publicUrl,
      };
    }

    return {
      signedUrl: signedUrlData.signedUrl,
      path: data.path,
      publicUrl: publicUrlData.publicUrl,
    };
  } catch (error) {
    console.error("Error uploading image to Supabase:", error);
    throw error;
  }
}

/** One bucket (make sure it exists in Supabase → Storage and allow public read) */
const BUCKET = process.env.EXPO_PUBLIC_SB_BUCKET || "chat-uploads";

/** Turn a local file URI (file:// …) into a Blob (works in Expo RN) */
async function uriToBlob(uri) {
  const res = await fetch(uri);
  if (!res.ok) throw new Error(`Failed to read file: ${res.status}`);
  return await res.blob();
}

/**
 * Upload a local image (from ImagePicker) and get a PUBLIC URL.
 * @param {string} localUri  file://… from ImagePicker
 * @param {string} pathPrefix  optional folder name in the bucket (default 'pawlo')
 * @returns {Promise<{ publicUrl: string, path: string }>}
 */

function guessMime(uri) {
  const ext = (uri.split(".").pop() || "").toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "heic") return "image/heic";
  if (ext === "heif") return "image/heif";
  return "application/octet-stream";
}

/**
 * Upload a local image and return a URL that WILL open (signed),
 * regardless of bucket privacy.
 */
export async function uploadChatImage(localUri, pathPrefix = "pawlo") {
  if (!localUri) throw new Error("No localUri");
  if (!BUCKET) throw new Error("Bucket not configured");

  // Read bytes reliably (avoids 0-byte uploads)
  const resp = await fetch(localUri);
  if (!resp.ok) throw new Error(`Read file failed: ${resp.status}`);
  const ab = await resp.arrayBuffer();
  if (!ab || ab.byteLength === 0) throw new Error("Read file produced 0 bytes");

  const ext = (localUri.split(".").pop() || "jpg").toLowerCase();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `${pathPrefix}/${filename}`;
  const contentType = guessMime(localUri);

  const { error: upErr } = await supabase
    .storage
    .from(BUCKET)
    .upload(path, ab, { contentType, upsert: false });

  if (upErr) throw upErr;

  // Always return a signed URL so it works for private buckets too
  const { data: signed, error: signErr } =
    await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days

  if (signErr || !signed?.signedUrl)
    throw new Error(`Could not create signed URL: ${signErr?.message || "unknown"}`);

  console.log("[UPLOAD] signedUrl →", signed.signedUrl);
  return { publicUrl: signed.signedUrl, path };
}

;