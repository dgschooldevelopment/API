// notificationController.js
const admin = require('firebase-admin');
const serviceAccount = require('path/to/serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const sendNotification = async (req, res) => {
    const { fcmToken, message } = req.body;

    if (!fcmToken || !message) {
        return res.status(400).json({ error: 'FCM token and message are required' });
    }

    const messagePayload = {
        notification: { 

        notification: {
            title: 'Notification Title',
            body: message,
        },
        token: fcmToken,
    };

    try {
        await admin.messaging().send(messagePayload);
        return res.status(200).json({ success: true, message: 'Notification sent successfully' });
    } catch (error) {
        console.error('Error sending notification:', error);
        return res.status(500).json({ error: 'Failed to send notification' });
    }
};

module.exports = { sendNotification };
