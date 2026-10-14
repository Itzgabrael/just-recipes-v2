import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";

import { db } from "./firebase";

/**
 * Creates or updates the public profile document for the current user.
 *
 * Only public identity information belongs here.
 * Never put email, provider, photoPath, or other private account
 * information into this document.
 */
export async function syncPublicUserProfile(user) {
  if (!user?.uid) {
    throw new Error("Authenticated user is required.");
  }

  const publicProfileRef = doc(
    db,
    "publicProfiles",
    user.uid
  );

  await setDoc(
    publicProfileRef,
    {
      uid: user.uid,
      displayName: user.displayName || "User",
      photoURL: user.photoURL || "",
    },
    {
      merge: true,
    }
  );
}

/**
 * Loads public profile information for any user.
 *
 * This reads from publicProfiles instead of the private users collection.
 */
export async function getPublicUserProfile(userId) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const publicProfileRef = doc(
    db,
    "publicProfiles",
    userId
  );

  const publicProfileSnap = await getDoc(
    publicProfileRef
  );

  if (!publicProfileSnap.exists()) {
    return null;
  }

  const profileData = publicProfileSnap.data();

  return {
    uid: userId,
    displayName: profileData.displayName || "User",
    photoURL: profileData.photoURL || "",
  };
}

/**
 * Loads recipes created by a specific user.
 */
export async function getPublicUserRecipes(userId) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const recipesQuery = query(
    collection(db, "recipes"),
    where("ownerId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(recipesQuery);

  return snapshot.docs.map((recipeDoc) => ({
    id: recipeDoc.id,
    ...recipeDoc.data(),
  }));
}