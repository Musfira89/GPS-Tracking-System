import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  type: import.meta.env.VITE_FIREBASE_TYPE,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  privateKeyId: import.meta.env.VITE_FIREBASE_PRIVATE_KEY_ID,
  privateKey: import.meta.env.VITE_FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  clientEmail: import.meta.env.VITE_FIREBASE_CLIENT_EMAIL,
  clientId: import.meta.env.VITE_FIREBASE_CLIENT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { app, db };
