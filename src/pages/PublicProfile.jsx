import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RecipeCard from "../components/RecipeCard";
import { getPublicUserProfile, getPublicUserRecipes } from "../services/userProfileService";
import { getRatingSummaries } from "../services/ratingService";

function getInitials(displayName) {
  if (!displayName) {
    return "U";
  }

  const words = displayName.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (
    words[0].charAt(0) +
    words[words.length - 1].charAt(0)
  ).toUpperCase();
}

function PublicProfile() {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const isOwner = currentUser?.uid === userId;

  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ratingSummaries, setRatingSummaries] = useState({});

  useEffect(() => {
    async function loadPublicProfile() {
      try {
        setLoading(true);
        setError("");

        const [publicProfile, publicRecipes] =
          await Promise.all([
            getPublicUserProfile(userId),
            getPublicUserRecipes(userId),
          ]);

        if (!publicProfile) {
          setError("User profile not found.");
          return;
        }

        setProfile(publicProfile);
        setRecipes(publicRecipes);
      } catch (error) {
        console.error(
          "Error loading public profile:",
          error
        );

        setError(
          error.message ||
            "Failed to load user profile."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadPublicProfile();
  }, [userId]);

    /*
  =========================================================
  LOAD RECIPE RATING SUMMARIES
  =========================================================
  */

  useEffect(() => {
    let cancelled = false;

    async function loadRatingSummaries() {
      try {
        const recipeIds = recipes.map(
          (recipe) => recipe.id
        );

        const summaries =
          await getRatingSummaries(recipeIds);

        if (!cancelled) {
          setRatingSummaries(summaries);
        }
      } catch (error) {
        console.error(
          "Error loading profile recipe ratings:",
          error
        );

        if (!cancelled) {
          setRatingSummaries({});
        }
      }
    }

    void loadRatingSummaries();

    return () => {
      cancelled = true;
    };
  }, [recipes]);

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-10">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Loading profile...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen px-4 py-10">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-red-600 dark:text-red-400">
            {error}
          </p>

          <Link
            to="/"
            className="mt-4 inline-block text-green-600 hover:text-green-700"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const initials = getInitials(profile.displayName);

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-5xl">

        {/* PROFILE HEADER */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex flex-col items-center text-center">

            {profile.photoURL ? (
              <img
                src={profile.photoURL}
                alt={`${profile.displayName}'s profile`}
                className="h-28 w-28 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-700 dark:bg-green-900/40 dark:text-green-400">
                {initials}
              </div>
            )}

            <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              {profile.displayName}
            </h1>

            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {recipes.length}{" "}
              {recipes.length === 1
                ? "recipe"
                : "recipes"}
            </p>
            {isOwner && (
                <Link
                to="/profile"
                className="mt-4 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700 dark:hover:bg-green-500"
                >
                    Manage Profile
                    </Link>
                )}
          </div>
        </section>

        {/* RECIPES */}
        <section className="mt-8">
          <h2 className="mb-5 text-2xl font-bold text-gray-900 dark:text-white">
            {profile.displayName}'s Recipes
          </h2>

          {recipes.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
              <p className="text-gray-500 dark:text-gray-400">
                This user hasn't published any recipes yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  ratingSummary={ratingSummaries[recipe.id]}
                />
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}

export default PublicProfile;