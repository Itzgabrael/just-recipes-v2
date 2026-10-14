import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import {getStorage} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCLDrMrc99xqu8F_v5Hx_oT2NyWSaiH0f4",
  authDomain: "just-recipes-v2.firebaseapp.com",
  projectId: "just-recipes-v2",
  storageBucket: "just-recipes-v2.firebasestorage.app",
  messagingSenderId: "496014144775",
  appId: "1:496014144775:web:575db8e56ce601736981a2",
  measurementId: "G-GD2NWPSMLG"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);