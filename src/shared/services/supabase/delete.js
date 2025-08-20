import { supabase } from "./client";

/**
 * Deletes an image from Supabase storage
 * @param {string} bucketName - The name of the Supabase storage bucket
 * @param {string} filePath - The path of the file in the bucket (returned from upload)
 * @returns {Promise<boolean>} - Returns true if deletion succeeded
 */
export const deleteImageFromSupabase = async (bucketName, filePath) => {
  if (!bucketName) {
    throw new Error("Bucket name is required");
  }

  if (!filePath) {
    throw new Error("File path is required");
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error("Supabase delete error:", error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
    console.log("Image deleted successfully:", data);
    return true;
  } catch (error) {
    console.error("Error deleting image from Supabase:", error);
    throw error;
  }
};
