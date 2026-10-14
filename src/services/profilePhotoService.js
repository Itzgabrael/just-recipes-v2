import { supabase } from "./supabase";

const MAX_PROFILE_PHOTO_SIZE = 2 * 1024 * 1024;

const ALLOWED_PROFILE_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function getFileExtension(file) {
  const extensionMap = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  return extensionMap[file.type];
}

export async function uploadProfilePhoto(firebaseUser, file) {
  if (!firebaseUser) {
    throw new Error("You must be signed in.");
  }

  if (!file) {
    throw new Error("Please select an image.");
  }

  if (!ALLOWED_PROFILE_PHOTO_TYPES.has(file.type)) {
    throw new Error("Profile photo must be JPEG, PNG, or WebP.");
  }

  if (file.size > MAX_PROFILE_PHOTO_SIZE) {
    throw new Error("Profile photo must be 2 MB or smaller.");
  }

  const extension = getFileExtension(file);

  const filePath = `${firebaseUser.uid}/profile-${crypto.randomUUID()}.${extension}`;

  const { data, error } = await supabase.storage
    .from("profile-photos")
    .upload(filePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from("profile-photos")
    .getPublicUrl(data.path);

  return {
    path: data.path,
    publicUrl: publicUrlData.publicUrl,
  };
}

export async function deleteProfilePhoto(firebaseUser, photoPath) {
  if (!firebaseUser) {
    throw new Error("You must be signed in.");
  }

  if (!photoPath) {
    throw new Error("No profile photo to remove.");
  }

  const { error } = await supabase.storage
    .from("profile-photos")
    .remove([photoPath]);

  if (error) {
    throw error;
  }
}