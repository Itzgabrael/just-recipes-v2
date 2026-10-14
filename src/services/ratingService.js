
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { db } from "./firebase";

const RATING_BATCH_SIZE = 30;

export async function getRatingSummaries(recipeIds) {
  const uniqueRecipeIds = [
    ...new Set(
      recipeIds.filter(
        (recipeId) =>
          typeof recipeId === "string" &&
          recipeId.length > 0
      )
    ),
  ];

  const summaries = {};

 
const batches = [];
for (let index = 0; index < uniqueRecipeIds.length; index += RATING_BATCH_SIZE) {
  batches.push(uniqueRecipeIds.slice(index, index + RATING_BATCH_SIZE));
}

const snapshots = await Promise.all(
  batches.map((batch) => {
    const ratingsQuery = query(
      collection(db, "ratings"),
      where("recipeId", "in", batch)
    );

    return getDocs(ratingsQuery);
  })
);

snapshots.forEach((snapshot) => {
  snapshot.forEach((ratingDoc) => {
    const { recipeId, rating } = ratingDoc.data();

    if (
      typeof rating !== "number" ||
      rating < 1 ||
      rating > 5
    ) {
      return;
    }

    if (!summaries[recipeId]) {
      summaries[recipeId] = {
        total: 0,
        count: 0,
      };
    }

    summaries[recipeId].total += rating;
    summaries[recipeId].count += 1;
  });
});


  for (const recipeId of uniqueRecipeIds) {
    const summary = summaries[recipeId];

    if (summary) {
      summaries[recipeId] = {
        average: summary.total / summary.count,
        count: summary.count,
      };
    } else {
      summaries[recipeId] = {
        average: 0,
        count: 0,
      };
    }
  }

  return summaries;
}
