const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.outstandingHabits = functions.firestore
  .document('users/{userId}')
  .onUpdate((change, context) => {
    const oldOutstanding = change.before.data().outstanding;
    const newOutstanding = change.after.data().outstanding;
    const userName = change.after.data().username;
    const userFcm = change.after.data().fcm;

    const notificationContent = {
      notification: {
        title: `Habits outstanding`,
        body: `Hey ${userName}, it looks like you have some habits outstanding. Check in today to keep up with them.`,
        icon: 'default',
        sound: 'default',
      },
    };

    if (!oldOutstanding && newOutstanding) {
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
    }
    return null;
  });
