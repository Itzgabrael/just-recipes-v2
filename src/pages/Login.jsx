import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import {FaUtensils} from "react-icons/fa";

import { loginWithEmail, resetPassword, signInWithGoogle } from "../services/auth";
import { getAuthErrorMessage } from "../utils/authErrors";
import toast from "react-hot-toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

const navigate = useNavigate();
const location = useLocation();
const from = location.state?.from?.pathname || "/";

  const handleGoogleLogin = async () => {
  if (isGoogleLoading || isLoginLoading) return;

  try {
    setIsGoogleLoading(true);

    const user = await signInWithGoogle(rememberMe);

    console.log("User signed in:", user);

    toast.success("Successfully signed in with Google!");

    void navigate(from, { replace: true });
  } catch (error) {
    console.error("Google sign-in error:", error);

    toast.error(
      getAuthErrorMessage(error)
    );
  } finally {
    setIsGoogleLoading(false);
  }
};

const handleLogin = async () => {
  if (isLoginLoading || isGoogleLoading) return;

  if (!email.trim() || !password) {
    toast.error("Please enter your email and password.");
    return;
  }

  try {
    setIsLoginLoading(true);

    const user = await loginWithEmail(
      email.trim(),
      password,
      rememberMe
    );

    console.log("User signed in:", user);

    toast.success("Successfully signed in!");

    void navigate(from, { replace: true });
  } catch (error) {
  console.error("Email login error:", error);
  toast.error(
    getAuthErrorMessage(error)
  );
} finally {
    setIsLoginLoading(false);
  }
};
const handleForgotPassword = async () => {
  if (isResetLoading || isLoginLoading || isGoogleLoading) return;

  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    toast.error("Enter your email address first.");
    return;
  }

  try {
    setIsResetLoading(true);

    await resetPassword(trimmedEmail);

    toast.success(
      "Password reset email sent. Check your inbox."
    );
  } catch (error) {
    console.error("Password reset error:", error);

    toast.error(
      getAuthErrorMessage(error)
    );
  } finally {
    setIsResetLoading(false);
  }
};

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-100 px-6">

      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-center mb-2">
          Welcome Back <FaUtensils className="inline text-green-600 text-lg"/>
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Login to continue exploring delicious <span className="text-green-600 font-bold">recipes</span>.
        </p>

        <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading || isLoginLoading}
        className="group w-full border border-gray-300 rounded-lg py-3 flex items-center justify-center gap-3 hover:bg-gray-100 transition disabled:opacity-60 disabled:cursor-not-allowed">
         {isGoogleLoading ? (
  <>
    <FcGoogle
      size={24}
      className="animate-pulse"
    />

    <span className="w-5 h-5 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin" />

    <span>Signing in...</span>
  </>
) : (
  <>
    <FcGoogle
      size={24}
      className="transition-transform duration-300 group-hover:scale-110"
    />

    Continue with Google
  </>
)}
        </button>

        <div className="flex items-center my-8">

          <hr className="flex-1" />

          <span className="px-4 text-gray-400">
            OR
          </span>

          <hr className="flex-1" />

        </div>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          className="w-full border rounded-lg px-4 py-3 mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          className="w-full border rounded-lg px-4 py-3 mb-3"
        />
        <div className="flex items-center justify-between mb-6">
  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
    <input
      type="checkbox"
      checked={rememberMe}
      onChange={(e) => setRememberMe(e.target.checked)}
      className="w-4 h-4 accent-green-600 cursor-pointer"
    />

    {" "}Remember me
  </label>
</div>
<div className="flex justify-end mb-6">
  <button
    type="button"
    onClick={handleForgotPassword}
    disabled={
      isResetLoading ||
      isLoginLoading ||
      isGoogleLoading
    }
    className="text-sm text-green-600 font-semibold hover:text-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {isResetLoading
      ? "Sending reset email..."
      : "Forgot Password?"}
  </button>
</div>

        <button
  type="button"
  onClick={handleLogin}
  disabled={isLoginLoading || isGoogleLoading}
  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
>
  {isLoginLoading ? (
    <span className="inline-flex items-center justify-center gap-2">
      <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      <span>Signing in...</span>
    </span>
  ) : (
    "Login"
  )}
</button>

        <p className="text-center mt-6">

          Don't have an account?

          <Link
            to="/register"
            className="text-green-600 font-semibold ml-2"
          >
            Sign Up
          </Link>

        </p>

      </div>

    </section>
  );
}

export default Login;