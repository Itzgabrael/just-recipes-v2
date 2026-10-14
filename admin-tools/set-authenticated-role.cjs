"use strict";

const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

initializeApp();

async function getAllUsers(nextPageToken, allUsers = []) {
  const listUsersResult = await getAuth().listUsers(
    1000,
    nextPageToken
  );

  const users = [...allUsers, ...listUsersResult.users];

  if (!listUsersResult.pageToken) {
    return users;
  }

  return getAllUsers(listUsersResult.pageToken, users);
}

async function setRoleCustomClaim() {
  const allUsers = await getAllUsers();

  await Promise.all(
    allUsers.map(async (userRecord) => {
      try {
        const existingClaims = userRecord.customClaims || {};

        if (existingClaims.role === "authenticated") {
          console.log(
            `Already configured: ${userRecord.email || userRecord.uid}`
          );

          return;
        }

        await getAuth().setCustomUserClaims(userRecord.uid, {
          ...existingClaims,
          role: "authenticated",
        });

        console.log(
          `Updated user: ${userRecord.email || userRecord.uid}`
        );
      } catch (error) {
        console.error(
          `Failed to update user ${userRecord.uid}:`,
          error.message
        );
      }
    })
  );
}

setRoleCustomClaim()
  .then(() => {
    console.log("Finished assigning authenticated role.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to assign authenticated role:", error);
    process.exit(1);
  });