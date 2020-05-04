const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

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

exports.flipOutstandingGoal = functions.firestore
  .document('users/{userId}/goals/{goal}/habits/{habit}')
  .onUpdate((change, context) => {
    const oldOutstanding = change.before.data().outstanding;
    const newOutstanding = change.after.data().outstanding;
    const userId = context.params.userId;
    const goal = context.params.goal;

    if (!oldOutstanding && newOutstanding) {
      db.doc(`users/${userId}/goals/${goal}`).update({ outstanding: true });
    }
    if (oldOutstanding && !newOutstanding) {
      db.collection(`users/${userId}/goals/${goal}/habits`)
        .where('outstanding', '==', true)
        .get()
        .then((snapshot) => {
          if (snapshot.empty) {
            db.doc(`users/${userId}/goals/${goal}`).update({
              outstanding: false,
            });
          }

          return null;
        })
        .catch(console.log);
    }

    return null;
  });

exports.flipOutstandingUser = functions.firestore
  .document('users/{userId}/goals/{goal}')
  .onUpdate((change, context) => {
    const oldOutstanding = change.before.data().outstanding;
    const newOutstanding = change.after.data().outstanding;
    const userId = context.params.userId;

    if (!oldOutstanding && newOutstanding) {
      db.doc(`users/${userId}`).update({ outstanding: true });
    }

    if (oldOutstanding && !newOutstanding) {
      db.collection(`users/${userId}/goals/`)
        .where('outstanding', '==', true)
        .get()
        .then((snapshot) => {
          if (snapshot.empty) {
            db.doc(`users/${userId}`).update({
              outstanding: false,
            });
          }
          return null;
        })
        .catch(console.log);
    }

    return null;
  });
