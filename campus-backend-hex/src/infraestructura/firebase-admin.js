/**
 * Inicialización de Firebase Admin SDK para backend Node.js.
 * Usa service account desde archivo JSON (más seguro y sin problemas de escaping).
 */
const { initializeApp, cert } = require("firebase-admin/app");
const path = require("path");

const serviceAccount = require("../../service-account.json");

initializeApp({
  credential: cert(serviceAccount),
});

const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();

module.exports = { db };
