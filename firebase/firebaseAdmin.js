const { getApp, getApps, initializeApp } = require("firebase-admin/app");

const { getAuth } = require("firebase-admin/auth");
const serviceAccount = require("./service-account.json");
const { credential } = require("firebase-admin");

const adminCredentials = {
  credential: credential.cert(serviceAccount),
};
// avoid initializing twice
const firebaseAdminApp =
  getApps().length === 0 ? initializeApp(adminCredentials) : getApp();
module.exports = getAuth(firebaseAdminApp);
