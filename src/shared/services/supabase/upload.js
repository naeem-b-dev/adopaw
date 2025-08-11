import { supabase } from "./client";
import * as FileSystem from "expo-file-system";

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
};
