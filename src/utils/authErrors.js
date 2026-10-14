export function getAuthErrorMessage(error) {
  const code = error?.code;

  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/invalid-credential":
      return "Incorrect email or password.";

    case "auth/user-not-found":
      return "We couldn't find an account with those details.";

    case "auth/wrong-password":
      return "Incorrect email or password.";

    case "auth/email-already-in-use":
      return "An account with this email already exists.";

    case "auth/weak-password":
      return "Your password is too weak. Please choose a stronger password.";

    case "auth/missing-password":
      return "Please enter your password.";

    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";

    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";

    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";

    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in popup.";

    case "auth/cancelled-popup-request":
      return "Another Google sign-in request is already in progress.";

    case "auth/operation-not-allowed":
      return "This sign-in method is currently unavailable.";

    case "auth/requires-recent-login":
      return "Please sign in again before continuing.";

    case "auth/user-disabled":
      return "This account has been disabled.";

    case "auth/unauthorized-domain":
      return "This website is not authorized for authentication.";

    case "auth/expired-action-code":
      return "This password reset link has expired.";

    case "auth/invalid-action-code":
      return "This password reset link is invalid or has already been used.";

    default:
      return "Something went wrong. Please try again.";
  }
}