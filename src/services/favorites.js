import {
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

const favoritesRef = collection(db, "favorites");

export async function addFavorite(userId, recipeId) {
  await addDoc(favoritesRef, {
    userId,
    recipeId,
    createdAt: serverTimestamp(),
  });
}

export async function removeFavorite(userId, recipeId) {
  const q = query(
    favoritesRef,
    where("userId", "==", userId),
    where("recipeId", "==", recipeId)
  );

  const snapshot = await getDocs(q);

  await Promise.all(
    snapshot.docs.map((docItem) =>
      deleteDoc(docItem.ref)
    )
  );
}

export async function isFavorite(userId, recipeId) {
  const q = query(
    favoritesRef,
    where("userId", "==", userId),
    where("recipeId", "==", recipeId)
  );

  const snapshot = await getDocs(q);

  return !snapshot.empty;
}

export async function getFavorites(userId) {
  const q = query(
    favoritesRef,
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}