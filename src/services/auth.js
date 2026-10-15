import { auth, db} from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
}from "firebase/firestore";

import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { syncPublicUserProfile } from "./userProfileService";

const provider = new GoogleAuthProvider();
async function setAuthPersistence(rememberMe) {
  await setPersistence(
    auth,
    rememberMe
      ? browserLocalPersistence
      : browserSessionPersistence
  );
}

export async function signInWithGoogle(rememberMe = true) {
  try{
    await setAuthPersistence(rememberMe);
  const result = await 
    signInWithPopup(auth, provider);
   const user = result.user;
   const userRef = doc(db, "users", user.uid);
   const userSnap = await getDoc(userRef);
   if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      role: "user",
      recipesCreated: 0,
      favorites: [],
      recentlyViewed: [],
      guestImported: false,
    });
   }
   await syncPublicUserProfile(user);
    return user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
}
export async function loginWithEmail(
  email,
  password,
  rememberMe = true
) {
  await setAuthPersistence(rememberMe);

  const result = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = result.user;

  await user.reload();

  if (!user.emailVerified) {
    await signOut(auth);

    const error = new Error(
      "Please verify your email address before signing in. Check your inbox for the verification link."
    );

    error.code = "auth/email-not-verified";

    throw error;
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName || "",
      email: user.email,
      photoURL: user.photoURL || "",
      createdAt: serverTimestamp(),
      role: "user",
      recipesCreated: 0,
      favorites: [],
      recentlyViewed: [],
      guestImported: false,
    });
  }

  await syncPublicUserProfile(user);

  return user;
}


export async function resendVerificationEmail(
  email,
  password,
  rememberMe = true
) {
  await setAuthPersistence(rememberMe);

  const result = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = result.user;

  try {
    await user.reload();

    if (user.emailVerified) {
      const error = new Error(
        "This email address is already verified. You can log in normally."
      );

      error.code = "auth/email-already-verified";
      throw error;
    }

    await sendEmailVerification(user);
  } finally {
    await signOut(auth);
  }

  return true;
}


export async function registerWithEmail(
  email,
  password,
  rememberMe = true
) {
  await setAuthPersistence(rememberMe);

  const result = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = result.user;

  try {
    await sendEmailVerification(user);
  } catch (error) {
    // The account may already exist even if email delivery fails.
    await signOut(auth);
    throw error;
  }

  await signOut(auth);

  return {
    email: user.email,
    verificationEmailSent: true,
  };
}
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}
export async function logoutUser() {
    await signOut(auth);
  }
  export async function updateUserProfile(user, profileData) {
  if (!user) {
    throw new Error("You must be signed in to update your profile.");
  }

  if (!profileData || typeof profileData !== "object") {
    throw new Error("Invalid profile data.");
  }

  const displayName = profileData.displayName?.trim();

  if (!displayName) {
    throw new Error("Display name cannot be empty.");
  }

  await updateProfile(user, {
    displayName,
  });

  const userRef = doc(db, "users", user.uid);

  await setDoc(
    userRef,
    {
      displayName,
    },
    { merge: true }
  );

  return user;
}
export async function updateUserProfilePhoto(user, photoURL, photoPath) {
  if (!user) {
    throw new Error("You must be signed in to update your profile photo.");
  }

  if (!photoURL || !photoPath) {
    throw new Error("Invalid profile photo data.");
  }

  await updateProfile(user, { photoURL });

  const userRef = doc(db, "users", user.uid);

  await setDoc(
    userRef,
    {
      photoURL,
      photoPath,
    },
    { merge: true }
  );

  return user;
}

export async function removeUserProfilePhoto(user) {
  if (!user) {
    throw new Error("You must be signed in to remove your profile photo.");
  }

  await updateProfile(user, {
    photoURL: "",
  });

  await user.reload();

  const userRef = doc(db, "users", user.uid);

  await setDoc(
    userRef,
    {
      photoURL: "",
      photoPath: "",
    },
    { merge: true }
  );

  return user;
}