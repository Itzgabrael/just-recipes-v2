import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { getMyRecipes } from "../services/recipeService";
import { updateUserProfile, updateUserProfilePhoto, removeUserProfilePhoto } from "../services/auth";
import { uploadProfilePhoto, deleteProfilePhoto } from "../services/profilePhotoService";
import { syncPublicUserProfile } from "../services/userProfileService";

function getProviderLabel(providerId) {
  const providerLabels = {
    "password": "Email / Password",
    "google.com": "Google",
    "facebook.com": "Facebook",
    "github.com": "GitHub",
    "apple.com": "Apple",
  };

  return providerLabels[providerId] || providerId;
}

function formatAccountCreationDate(creationTime) {
  if (!creationTime) {
    return "Unavailable";
  }

  return new Date(creationTime).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
}

function Profile() {
  const { currentUser } = useAuth();
  console.log("Firebase Auth user:", {
    uid: currentUser?.uid,
    displayName: currentUser?.displayName,
    photoURL: currentUser?.photoURL,
  });
  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  const [recipeCount, setRecipeCount] = useState(0);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [photoPreview, setPhotoPreview] = useState(currentUser?.photoURL || "");
  const [photoPath, setPhotoPath] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [photoSaving, setPhotoSaving] = useState(false);
  const photoInputRef = useRef(null);

  useEffect(() => {
  async function loadRecipeCount() {
    try {
      const myRecipes = await getMyRecipes(currentUser);
      setRecipeCount(myRecipes.length);

      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();

        setPhotoPath(userData.photoPath || "");
      }
      await syncPublicUserProfile(currentUser);
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      setLoadingRecipes(false);
    }
  }

  void loadRecipeCount();
}, [currentUser]);



  async function handlePhotoChange(event) {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  setPhotoError("");

  const temporaryPreviewUrl = URL.createObjectURL(file);
  setPhotoPreview(temporaryPreviewUrl);

  try {
    setPhotoSaving(true);

    const { publicUrl, path } = await uploadProfilePhoto(currentUser, file);

    await updateUserProfilePhoto(currentUser, publicUrl, path);
    await syncPublicUserProfile(currentUser);
    setPhotoPreview(publicUrl);
    setPhotoPath(path);
  } catch (error) {
    console.error("Error uploading profile photo:", error);

    setPhotoError(
      error.message || "Failed to upload profile photo."
    );

    // Restore the previous photo if upload fails.
    setPhotoPreview(currentUser?.photoURL || "");
  } finally {
    URL.revokeObjectURL(temporaryPreviewUrl);
    setPhotoSaving(false);

    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
  }
}

  async function handleSaveProfile(event) {
  event.preventDefault();

  setError("");
  setSuccess("");

  try {
    setSaving(true);

    await updateUserProfile(currentUser, {
      displayName,
    });

    // Update the public profile as well
    await syncPublicUserProfile(currentUser);

    setSuccess("Profile updated successfully.");
  } catch (error) {
    console.error("Error updating profile:", error);
    setError(error.message || "Failed to update profile.");
  } finally {
    setSaving(false);
  }
}

async function handleRemovePhoto() {
  if (!currentUser?.photoURL) {
    return;
  }

  setPhotoError("");

  try {
    setPhotoSaving(true);

    // Get the stored path before clearing the profile data.
    const currentPhotoPath = photoPath;

if (currentPhotoPath) {
  await deleteProfilePhoto(currentUser, currentPhotoPath);
}

    await removeUserProfilePhoto(currentUser);
    await syncPublicUserProfile(currentUser);
    setPhotoPreview("");
    setPhotoPath("");
  } catch (error) {
    console.error("Error removing profile photo:", error);

    setPhotoError(
      error.message || "Failed to remove profile photo."
    );
  } finally {
    setPhotoSaving(false);
  }
}

  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Profile
        </h1>

        <div className="mt-6">
          <div className="mb-8">
  <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
    Profile Photo
  </p>

  <div className="flex items-center gap-4">
    <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
      {photoPreview ? (
        <img
          src={photoPreview}
          alt="Profile"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-600 dark:text-gray-300">
          {(currentUser.displayName || currentUser.email || "U")
            .charAt(0)
            .toUpperCase()}
        </div>
      )}
    </div>

    <div>
      <input
        ref={photoInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handlePhotoChange}
        className="hidden"
        id="profile-photo-input"
      />

      <label
        htmlFor="profile-photo-input"
        className={`inline-flex cursor-pointer items-center rounded-md px-4 py-2 text-sm font-medium text-white ${
          photoSaving
            ? "cursor-not-allowed bg-gray-400"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {photoSaving ? "Uploading..." : "Change Photo"}
      </label>

      {photoPreview && (
  <button
    type="button"
    onClick={handleRemovePhoto}
    disabled={photoSaving}
    className={`ml-2 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
      photoSaving
        ? "cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
        : "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
    }`}
  >
    Remove Photo
  </button>
)}

      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        JPEG, PNG, or WebP · Maximum 2 MB
      </p>

      {photoError && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {photoError}
        </p>
      )}
    </div>
  </div>
</div>

          <form onSubmit={handleSaveProfile} className="mt-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Display Name
              </span>
              <input
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="p-2 border rounded-md w-full dark:bg-gray-800 dark:text-white"
              />
            </label>
            {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
              {success && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">{success}</p>
              )}
            <button
              type="submit"
              className={`mt-4 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white ${
                saving
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-green-600 hover:bg-green-900"
              }`}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
              </button>
          </form>
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
    Account Information
  </h2>

  <div className="mt-4 space-y-3">
    <p className="text-gray-700 dark:text-gray-300">
      <span className="font-semibold">Email:</span>{" "}
      {currentUser.email || "Unavailable"}
    </p>

    <p className="text-gray-700 dark:text-gray-300">
      <span className="font-semibold">Sign-in method:</span>{" "}
      {getProviderLabel(
        currentUser.providerData?.[0]?.providerId
      )}
    </p>

    <p className="text-gray-700 dark:text-gray-300">
      <span className="font-semibold">Account created:</span>{" "}
      {formatAccountCreationDate(
        currentUser.metadata?.creationTime
      )}
    </p>

    <p className="text-gray-700 dark:text-gray-300">
      <span className="font-semibold">Recipes:</span>{" "}
      {loadingRecipes ? "Loading..." : recipeCount}
    </p>
  </div>
</div>
        </div>
      </div>
    </section>
  );
}

export default Profile;