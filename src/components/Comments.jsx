import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { getPublicUserProfile } from "../services/userProfileService";

import {
  FaTrash,
  FaUserCircle,
  FaEdit,
  FaTimes,
  FaCheck,
} from "react-icons/fa";

import toast from "react-hot-toast";

function formatCommentDate(timestamp) {
  if (!timestamp?.seconds) {
    return "Just now";
  }

  const commentDate = new Date(timestamp.seconds * 1000);
  const now = new Date();

  const difference = now.getTime() - commentDate.getTime();

  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 10) {
    return "Just now";
  }

  if (seconds < 60) {
    return `${seconds} seconds ago`;
  }

  if (minutes < 60) {
    return `${minutes} ${
      minutes === 1 ? "minute" : "minutes"
    } ago`;
  }

  if (hours < 24) {
    return `${hours} ${
      hours === 1 ? "hour" : "hours"
    } ago`;
  }

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  return commentDate.toLocaleDateString();
}

function Comments({ recipeId }) {
  const { currentUser } = useAuth();

  const [comments, setComments] = useState([]);
  const [authorProfiles, setAuthorProfiles] = useState({});
  const [commentText, setCommentText] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Edit states
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete confirmation state
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /*
   * =====================================================
   * LOAD COMMENTS + PUBLIC AUTHOR PROFILES
   * =====================================================
   */
  useEffect(() => {
    async function loadComments() {
      try {
        const commentsRef = collection(db, "comments");

        const q = query(
          commentsRef,
          where("recipeId", "==", recipeId),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        const loadedComments = snapshot.docs.map(
          (commentDoc) => ({
            id: commentDoc.id,
            ...commentDoc.data(),
          })
        );

        setComments(loadedComments);

        /*
         * Collect unique author IDs.
         *
         * Multiple comments can belong to the same user,
         * so we only request each author's public profile
         * once for this comment list.
         */
        const uniqueAuthorIds = [
          ...new Set(
            loadedComments
              .map((comment) => comment.userId)
              .filter(Boolean)
          ),
        ];

        const profileResults = await Promise.all(
          uniqueAuthorIds.map(async (userId) => {
            try {
              const profile =
                await getPublicUserProfile(userId);

              return [userId, profile];
            } catch (error) {
              console.error(
                `Error loading profile for user ${userId}:`,
                error
              );

              return [userId, null];
            }
          })
        );

        /*
         * Convert:
         *
         * [
         *   ["uid1", profile1],
         *   ["uid2", profile2]
         * ]
         *
         * into:
         *
         * {
         *   uid1: profile1,
         *   uid2: profile2
         * }
         */
        const profileMap = Object.fromEntries(
          profileResults.filter(
            ([, profile]) => profile !== null
          )
        );

        setAuthorProfiles(profileMap);
      } catch (error) {
        console.error(
          "Error loading comments:",
          error
        );

        toast.error("Failed to load comments.");
      } finally {
        setLoading(false);
      }
    }

    void loadComments();
  }, [recipeId]);

  /*
   * =====================================================
   * ADD COMMENT
   * =====================================================
   */
  async function handleSubmit(event) {
    event.preventDefault();

    if (!currentUser) {
      toast.error(
        "Please log in to leave a comment."
      );
      return;
    }

    if (!commentText.trim()) {
      toast.error("Please write something first.");
      return;
    }

    try {
      setSubmitting(true);

      const commentData = {
        recipeId,
        userId: currentUser.uid,
        userName: currentUser.displayName || "User",
        userPhoto: currentUser.photoURL || "",
        text: commentText.trim(),
        createdAt: serverTimestamp(),
      };

      const commentRef = await addDoc(
        collection(db, "comments"),
        commentData
      );

      /*
       * Add the new comment immediately to local state
       * so the user does not have to reload the page.
       */
      setComments((prev) => [
        {
          id: commentRef.id,
          ...commentData,
          createdAt: {
            seconds: Date.now() / 1000,
          },
        },
        ...prev,
      ]);

      /*
       * The current user's profile is already available
       * through Firebase Auth, but the comment author
       * lookup uses the public profile system.
       *
       * Add the current profile to the local author map
       * immediately when available.
       */
      setAuthorProfiles((prev) => ({
        ...prev,
        [currentUser.uid]: {
          uid: currentUser.uid,
          displayName:
            currentUser.displayName || "User",
          photoURL: currentUser.photoURL || "",
        },
      }));

      setCommentText("");

      toast.success("Comment posted!");
    } catch (error) {
      console.error(
        "Error adding comment:",
        error
      );

      toast.error("Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * =====================================================
   * START EDITING
   * =====================================================
   */
  function handleStartEdit(comment) {
    setEditingCommentId(comment.id);
    setEditText(comment.text);
  }

  /*
   * =====================================================
   * CANCEL EDITING
   * =====================================================
   */
  function handleCancelEdit() {
    setEditingCommentId(null);
    setEditText("");
  }

  /*
   * =====================================================
   * SAVE EDITED COMMENT
   * =====================================================
   */
  async function handleSaveEdit(commentId) {
    const trimmedText = editText.trim();

    if (!trimmedText) {
      toast.error("Comment cannot be empty.");
      return;
    }

    try {
      setSavingEdit(true);

      const commentRef = doc(
        db,
        "comments",
        commentId
      );

      await updateDoc(commentRef, {
        text: trimmedText,
        updatedAt: serverTimestamp(),
      });

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                text: trimmedText,
              }
            : comment
        )
      );

      setEditingCommentId(null);
      setEditText("");

      toast.success("Comment updated!");
    } catch (error) {
      console.error(
        "Error updating comment:",
        error
      );

      toast.error("Failed to update comment.");
    } finally {
      setSavingEdit(false);
    }
  }

  /*
   * =====================================================
   * OPEN DELETE CONFIRMATION
   * =====================================================
   */
  function handleDeleteClick(comment) {
    setCommentToDelete(comment);
  }

  /*
   * =====================================================
   * CANCEL DELETE
   * =====================================================
   */
  function handleCancelDelete() {
    if (deleting) {
      return;
    }

    setCommentToDelete(null);
  }

  /*
   * =====================================================
   * CONFIRM DELETE
   * =====================================================
   */
  async function handleConfirmDelete() {
    if (!commentToDelete) {
      return;
    }

    try {
      setDeleting(true);

      await deleteDoc(
        doc(
          db,
          "comments",
          commentToDelete.id
        )
      );

      setComments((prev) =>
        prev.filter(
          (comment) =>
            comment.id !== commentToDelete.id
        )
      );

      toast.success("Comment deleted.");

      setCommentToDelete(null);
    } catch (error) {
      console.error(
        "Error deleting comment:",
        error
      );

      toast.error("Failed to delete comment.");
    } finally {
      setDeleting(false);
    }
  }

  /*
   * =====================================================
   * COMMENTS CONTENT
   * =====================================================
   *
   * Keeping this outside nested ternaries makes the JSX
   * easier to read and avoids the nested-ternary warning.
   */
  let commentsContent;

  if (loading) {
    commentsContent = (
      <p className="text-gray-500">
        Loading comments...
      </p>
    );
  } else if (comments.length === 0) {
    commentsContent = (
      <div className="text-gray-500">
        No comments yet. Be the first to share
        your thoughts!
      </div>
    );
  } else {
    commentsContent = (
      <div className="space-y-5">
        {comments.map((comment) => {
          /*
           * Prefer the current public profile.
           *
           * The old userName/userPhoto fields remain
           * as fallbacks for older comments.
           */
          const authorProfile =
            authorProfiles[comment.userId];

          const authorName =
            authorProfile?.displayName ||
            comment.userName ||
            "User";

          const authorPhoto =
            authorProfile?.photoURL ||
            comment.userPhoto ||
            "";

          return (
            <div
              key={comment.id}
              className="border-b border-gray-200 pb-5"
            >
              <div className="flex items-start gap-4">
                {/* Author */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {comment.userId ? (
                        <Link
                          to={`/users/${comment.userId}`}
                          className="flex items-center gap-3 rounded-lg transition hover:opacity-80"
                        >
                          {authorPhoto ? (
                            <img
                              src={authorPhoto}
                              alt={authorName}
                              className="h-11 w-11 rounded-full object-cover"
                            />
                          ) : (
                            <FaUserCircle className="text-4xl text-gray-400" />
                          )}

                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                              {authorName}
                            </h3>

                            <p className="text-xs text-gray-400">
                              {formatCommentDate(
                                comment.createdAt
                              )}
                            </p>
                          </div>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-3">
                          {authorPhoto ? (
                            <img
                              src={authorPhoto}
                              alt={authorName}
                              className="h-11 w-11 rounded-full object-cover"
                            />
                          ) : (
                            <FaUserCircle className="text-4xl text-gray-400" />
                          )}

                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                              {authorName}
                            </h3>

                            <p className="text-xs text-gray-400">
                              {formatCommentDate(
                                comment.createdAt
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Owner controls */}
                    {currentUser?.uid ===
                      comment.userId && (
                      <div className="flex items-center gap-4">
                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() =>
                            handleStartEdit(
                              comment
                            )
                          }
                          disabled={
                            editingCommentId ===
                            comment.id
                          }
                          className="text-xl text-blue-500 transition hover:text-blue-700 disabled:opacity-40"
                          title="Edit comment"
                        >
                          <FaEdit />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteClick(
                              comment
                            )
                          }
                          className="text-xl text-red-500 transition hover:text-red-700"
                          title="Delete comment"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Comment text / Edit form */}
                  {editingCommentId ===
                  comment.id ? (
                    <div className="mt-3">
                      <textarea
                        value={editText}
                        onChange={(event) =>
                          setEditText(
                            event.target.value
                          )
                        }
                        rows="3"
                        className="w-full resize-none rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />

                      <div className="mt-2 flex justify-end gap-2">
                        {/* Cancel */}
                        <button
                          type="button"
                          onClick={
                            handleCancelEdit
                          }
                          disabled={savingEdit}
                          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
                        >
                          <FaTimes />
                          Cancel
                        </button>

                        {/* Save */}
                        <button
                          type="button"
                          onClick={() =>
                            handleSaveEdit(
                              comment.id
                            )
                          }
                          disabled={savingEdit}
                          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:opacity-50"
                        >
                          <FaCheck />

                          {savingEdit
                            ? "Saving..."
                            : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 whitespace-pre-wrap wrap-break-word text-gray-700 dark:text-gray-300">
                      {comment.text}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <section className="mt-12 sm:mt-16">
      <h2 className="mb-6 text-2xl font-bold sm:text-3xl">
        Comments & Reviews{" "}
        <span className="ml-2 text-lg font-normal text-gray-500">
          ({comments.length}{" "}
          {comments.length === 1
            ? "Review"
            : "Reviews"}
          )
        </span>
      </h2>

      {/* Comment form */}
      {currentUser ? (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl bg-gray-50 p-4 sm:p-5"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Current user avatar */}
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={
                  currentUser.displayName ||
                  "Your profile"
                }
                className="h-10 w-10 shrink-0 rounded-full object-cover sm:h-11 sm:w-11"
              />
            ) : (
              <FaUserCircle className="shrink-0 text-3xl text-gray-400 sm:text-4xl" />
            )}

            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(event) =>
                  setCommentText(
                    event.target.value
                  )
                }
                placeholder="Share your thoughts about this recipe..."
                rows="4"
                className="w-full resize-none rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-base"
              />

              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-green-600 px-5 py-2 text-white transition hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting
                    ? "Posting..."
                    : "Post Comment"}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 rounded-xl bg-gray-50 p-5 text-gray-600">
          Please log in to leave a comment.
        </div>
      )}

      {/* Comments */}
      {commentsContent}

      {/* Delete confirmation modal */}
      {commentToDelete && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900">
              Delete comment?
            </h3>

            <p className="mt-2 text-gray-500">
              Are you sure you want to delete this
              comment? This action cannot be undone.
            </p>

            {/* Comment preview */}
            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
              "{commentToDelete.text}"
            </div>

            <div className="mt-6 flex justify-end gap-3">
              {/* Cancel */}
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={deleting}
                className="rounded-lg border border-gray-300 px-5 py-2 text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>

              {/* Delete */}
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex items-center gap-2 rounded-lg bg-red-500 px-5 py-2 text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                <FaTrash />

                {deleting
                  ? "Deleting..."
                  : "Delete Comment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Comments;