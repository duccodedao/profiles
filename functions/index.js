const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Triggered when a new document is created in the 'notifications' collection.
 * It sends a push notification to all subscribed users.
 */
exports.sendPushNotification = functions
    .region("asia-southeast1") // Optional: specify a region closer to you
    .firestore.document("notifications/{notificationId}")
    .onCreate(async (snap, context) => {
      // Get the new notification data
      const notificationData = snap.data();
      const title = notificationData.title;
      const body = notificationData.content;
      const icon = notificationData.iconUrl || "https://hdd.io.vn/img/bmassloadings.png";

      console.log(`New notification created: "${title}". Preparing to send push notifications.`);

      // 1. Get all FCM tokens from the 'fcmTokens' collection
      const tokensSnapshot = await admin.firestore().collection("fcmTokens").get();
      if (tokensSnapshot.empty) {
        console.log("No subscribed devices found. Aborting.");
        return null;
      }

      const tokens = tokensSnapshot.docs.map((doc) => doc.id);
      console.log(`Found ${tokens.length} tokens to send to.`);

      // 2. Construct the FCM message payload
      const payload = {
        notification: {
          title: title,
          body: body.substring(0, 150) + (body.length > 150 ? "..." : ""), // Truncate body
          icon: icon,
        },
        webpush: {
          fcm_options: {
            // Optional: Link to open when notification is clicked
            link: "https://your-app-url.com", // <<<<< IMPORTANT: REPLACE WITH YOUR URL
          },
        },
      };

      // 3. Send messages to all tokens
      const response = await admin.messaging().sendToDevice(tokens, payload);

      // 4. Clean up stale/invalid tokens
      const tokensToRemove = [];
      response.results.forEach((result, index) => {
        const error = result.error;
        if (error) {
          console.error(
              "Failure sending notification to",
              tokens[index],
              error,
          );
          // Check for errors indicating an invalid or unregistered token
          if (
            error.code === "messaging/invalid-registration-token" ||
            error.code === "messaging/registration-token-not-registered"
          ) {
            tokensToRemove.push(tokensSnapshot.docs[index].ref.delete());
          }
        }
      });

      if (tokensToRemove.length > 0) {
        await Promise.all(tokensToRemove);
        console.log(`Removed ${tokensToRemove.length} stale tokens.`);
      }

      console.log("Push notifications sent successfully.");
      return null;
    });
