import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged,} from "firebase/auth";

const AuthContext = createContext();


export function AuthProvider({ children }) {

  const [currentUser, setCurrentUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  /*
  ========================================================
  AUTHENTICATION LISTENER
  ========================================================
  */

  
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      const isGoogleUser = user.providerData.some(
        (provider) => provider.providerId === "google.com"
      );

      if (user.emailVerified || isGoogleUser) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }

    setLoading(false);
  });

  return unsubscribe;
}, []);



  /*
  ========================================================
  CONTEXT VALUE
  ========================================================
  */

  const value = useMemo(
  () => ({
    currentUser,
    loading,
  }),
  [currentUser, loading]
);


  /*
  ========================================================
  PROVIDER
  ========================================================
  */

  return (
    <AuthContext.Provider value={value}>

      {!loading && children}

    </AuthContext.Provider>
  );

}


/*
==========================================================
USE AUTH HOOK
==========================================================
*/

// This hook intentionally shares the provider's context from the same module.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {

  return useContext(
    AuthContext
  );

}