import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  privateKeyId: import.meta.env.VITE_FIREBASE_PRIVATE_KEY_ID,
  privateKey: import.meta.env.VITE_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  clientEmail: import.meta.env.VITE_FIREBASE_CLIENT_EMAIL,
  clientId: import.meta.env.VITE_FIREBASE_CLIENT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

const app = initializeApp({
  apiKey: "fake-api-key", // required, dummy works
  authDomain: `${firebaseConfig.projectId}.firebaseapp.com`,
  databaseURL: firebaseConfig.databaseURL,
  projectId: firebaseConfig.projectId,
  storageBucket: `${firebaseConfig.projectId}.appspot.com`,
  messagingSenderId: "fake-id", // optional
  appId: "fake-app-id", // optional
});

const db = getDatabase(app);

export { app, db };
