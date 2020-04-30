const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
exports.newUser = functions.firestore
  .document('users/{any}')
  .onCreate((change, context) => {
    const userName = change.data().username;
    const userFcm = change.data().fcm;

    const notificationContent = {
      notification: {
        title: `Welcome ${userName}`,
        body: 'Thanks for signing up',
        icon: 'default',
        sound: 'default',
      },
    };

    return admin
      .messaging()
      .sendToDevice(userFcm, notificationContent)
      .then((result) => {
        console.log('Notification sent successfully');
        return null;
      })
      .catch((error) => {
        console.log('Notification sent failed', error);
        return null;
      });
  });
