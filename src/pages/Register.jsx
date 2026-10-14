import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerWithEmail, signInWithGoogle } from "../services/auth";

const getAuthErrorMessage = (error) => {
  switch (error?.code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Your password is too weak.";
    case "auth/popup-closed-by-user":
      return "The Google sign-in window was closed before completion.";
    case "auth/network-request-failed":
      return "A network error occurred. Please try again.";
    default:
      return error?.message || "Something went wrong. Please try again.";
  }
};

function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSignup = async (event) => {
  event.preventDefault();

  setError("");

  if (!email.trim()) {
    setError("Please enter your email address.");
    return;
  }

  if (!password) {
    setError("Please enter a password.");
    return;
  }

  if (password.length < 6) {
    setError("Your password must be at least 6 characters.");
    return;
  }

  if (password !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  try {
    setLoading(true);

    await registerWithEmail(
      email.trim(),
      password,
      rememberMe
    );

    void navigate("/");
  } catch (error) {
    console.error("Registration error:", error);

    setError(
      getAuthErrorMessage(error)
    );
  } finally {
    setLoading(false);
  }
};

  const handleGoogleSignup = async () => {
  try {
    setError("");
    setLoading(true);

    await signInWithGoogle(rememberMe);

    void navigate("/");
  } catch (error) {
    console.error(error);

    setError(
      getAuthErrorMessage(error)
    );
  } finally {
    setLoading(false);
  }
};

  return (
  <div className="max-w-md mx-auto mt-20 bg-white shadow-lg rounded-xl p-8">
    <h1 className="text-3xl font-bold text-center mb-2">
      Create Account
    </h1>

    <p className="text-center text-gray-500 mb-8">
      Join Just <span className="text-green-6
      
      00">Recipe</span> and save your favourite recipes forever.
    </p>

    {error && (
      <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
        <p className="text-sm text-red-600">
          {error}
        </p>
      </div>
    )}

    <form
      onSubmit={handleEmailSignup}
      className="space-y-4"
    >
      <div>
        <label
          htmlFor="register-email"
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          Email
        </label>

        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          placeholder="you@example.com"
          disabled={loading}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
        />
      </div>

      <div>
        <label
          htmlFor="register-password"
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          Password
        </label>

        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          placeholder="At least 6 characters"
          disabled={loading}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
        />
      </div>

      <div>
        <label
          htmlFor="register-confirm-password"
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          Confirm Password
        </label>

        <input
          id="register-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(event) =>
            setConfirmPassword(event.target.value)
          }
          placeholder="Enter your password again"
          disabled={loading}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(event) =>
            setRememberMe(event.target.checked)
          }
          disabled={loading}
          className="w-4 h-4"
        />
        {" "}
        Remember me
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white rounded-lg py-3 font-semibold hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading
          ? "Creating Account..."
          : "Create Account"}
      </button>
    </form>

    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-sm text-gray-400">
        OR
      </span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>

    <button
      type="button"
      onClick={handleGoogleSignup}
      disabled={loading}
      className="w-full bg-white border border-gray-300 rounded-lg py-3 font-semibold hover:bg-gray-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading
        ? "Please wait..."
        : "Continue with Google"}
    </button>

    <p className="text-center text-gray-500 mt-6">
      Already have an account?{" "}
      <button
        type="button"
        onClick={() => navigate("/login")}
        className="text-green-600 cursor-pointer font-semibold"
      >
        Login
      </button>
    </p>
  </div>
);
}

export default Register;