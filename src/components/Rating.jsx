import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function Rating({ recipeId, onRatingChange}) {
  const { currentUser } = useAuth();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load ratings
  useEffect(() => {
    async function loadRatings() {
      if (!recipeId) {
        setLoading(false);
        return;
      }

      try {
        const ratingsRef = collection(db, "ratings");

        // Get ALL ratings for this recipe
        const recipeRatingsQuery = query(
          ratingsRef,
          where("recipeId", "==", recipeId)
        );

        const snapshot = await getDocs(recipeRatingsQuery);

        const ratings = snapshot.docs.map(
          (ratingDoc) => ratingDoc.data().rating
        );

        // Number of ratings
        setRatingCount(ratings.length);

        // Calculate average
        if (ratings.length > 0) {
          const total = ratings.reduce(
            (sum, currentRating) => sum + currentRating,
            0
          );

          const average = total / ratings.length;

          setAverageRating(average);
        } else {
          setAverageRating(0);
        }

        // Load current user's rating
        if (currentUser) {
          const userRatingQuery = query(
            ratingsRef,
            where("recipeId", "==", recipeId),
            where("userId", "==", currentUser.uid)
          );

          const userSnapshot = await getDocs(userRatingQuery);

          if (!userSnapshot.empty) {
            const existingRating =
              userSnapshot.docs[0].data();

            setRating(existingRating.rating);
          } else {
            setRating(0);
          }
        } else {
          setRating(0);
        }

      } catch (error) {
        console.error("Error loading ratings:", error);
      } finally {
        setLoading(false);
      }
    }

   void loadRatings();
  }, [currentUser, recipeId]);

  // Submit or update rating
  async function handleRating(selectedRating) {
    if (!currentUser) {
      toast.error("Please log in to rate this recipe.");
      return;
    }

    try {
      setSubmitting(true);

      const ratingsRef = collection(db, "ratings");

      const q = query(
        ratingsRef,
        where("recipeId", "==", recipeId),
        where("userId", "==", currentUser.uid)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        // Update existing rating
        const existingRatingDoc = snapshot.docs[0];

        await updateDoc(
          doc(db, "ratings", existingRatingDoc.id),
          {
            rating: selectedRating,
            updatedAt: serverTimestamp(),
          }
        );

        toast.success("Rating updated!");
      } else {
        // Create new rating
        await addDoc(ratingsRef, {
          recipeId,
          userId: currentUser.uid,
          rating: selectedRating,
          createdAt: serverTimestamp(),
        });

        toast.success("Rating submitted!");
      }

      setRating(selectedRating);

      // Recalculate the average immediately
      const updatedSnapshot = await getDocs(
        query(
          ratingsRef,
          where("recipeId", "==", recipeId)
        )
      );

      const updatedRatings = updatedSnapshot.docs.map(
        (ratingDoc) => ratingDoc.data().rating
      );

      setRatingCount(updatedRatings.length);

      if (updatedRatings.length > 0) {
        const total = updatedRatings.reduce(
          (sum, currentRating) => sum + currentRating,
          0
        );

       const newAverage = total / updatedRatings.length;
       setAverageRating(newAverage);
       if (onRatingChange) {
         onRatingChange(
          newAverage,
          updatedRatings.length
         );
       }
      }

    } catch (error) {
      console.error("Error saving rating:", error);

      toast.error("Failed to save rating.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mt-6">
        <p className="text-sm text-gray-400">
          Loading ratings...
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">

      {/* Overall rating */}
      <div className="flex flex-wrap items-center gap-3 mb-4">

        <div className="flex items-center gap-1">

          <FaStar className="text-yellow-400" />

          <span className="font-semibold text-lg">
            {averageRating > 0
              ? averageRating.toFixed(1)
              : "No ratings"}
          </span>

        </div>

        <span className="text-gray-400">
          •
        </span>

        <span className="text-gray-500 text-sm">
          {ratingCount}{" "}
          {ratingCount === 1 ? "rating" : "ratings"}
        </span>

      </div>

      {/* User rating */}
      <h3 className="text-lg font-semibold mb-2">
        Your Rating
      </h3>

      <div className="flex items-center gap-1">

        {[1, 2, 3, 4, 5].map((star) => (

          <button
            key={star}
            type="button"
            disabled={submitting}
            onClick={() => handleRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="text-2xl transition-transform duration-150 hover:scale-110 disabled:opacity-50"
            aria-label={`Rate ${star} out of 5`}
          >

            <FaStar
              className={
                star <= (hoverRating || rating)
                  ? "text-yellow-400"
                  : "text-gray-300"
              }
            />

          </button>

        ))}

      </div>

      {rating > 0 && (
        <p className="text-sm text-gray-500 mt-2">
          You rated this recipe {rating} out of 5
        </p>
      )}

      {!currentUser && (
        <p className="text-sm text-gray-500 mt-2">
          Log in to rate this recipe.
        </p>
      )}

    </div>
  );
}

export default Rating;