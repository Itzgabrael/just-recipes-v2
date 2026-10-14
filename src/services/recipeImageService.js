import { supabase } from "./supabase";

const MAX_RECIPE_IMAGE_SIZE = 10 * 1024 * 1024;

const ALLOWED_RECIPE_IMAGE_TYPES = new Set([
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

export async function uploadRecipeImage(firebaseUser, file) {
  if (!firebaseUser) {
    throw new Error("You must be signed in.");
  }

  if (!file) {
    throw new Error("Please select an image.");
  }

  if (!ALLOWED_RECIPE_IMAGE_TYPES.has(file.type)) {
    throw new Error(
      "Recipe image must be JPEG, PNG, or WebP."
    );
  }

  if (file.size > MAX_RECIPE_IMAGE_SIZE) {
    throw new Error(
      "Recipe image must be 10 MB or smaller."
    );
  }

  const extension = getFileExtension(file);

  const filePath =
    `${firebaseUser.uid}/recipes/${crypto.randomUUID()}.${extension}`;

  const { data, error } = await supabase.storage
    .from("recipe-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from("recipe-images")
    .getPublicUrl(data.path);

  return {
    path: data.path,
    publicUrl: publicUrlData.publicUrl,
  };
}

export async function deleteRecipeImage(
  firebaseUser,
  imagePath
) {
  if (!firebaseUser) {
    throw new Error("You must be signed in.");
  }

  if (!imagePath) {
    throw new Error("No recipe image to remove.");
  }

  const expectedPrefix =
  `${firebaseUser.uid}/recipes/`;

if (!imagePath.startsWith(expectedPrefix)) {
  throw new Error(
    "You are not allowed to delete this recipe image."
  );
}

  const { error } = await supabase.storage
    .from("recipe-images")
    .remove([imagePath]);

  if (error) {
    throw error;
  }
}