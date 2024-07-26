const admin = require('firebase-admin');
const serviceAccount = require('../config/serviceAccountKey.json');  // Adjust this path

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
