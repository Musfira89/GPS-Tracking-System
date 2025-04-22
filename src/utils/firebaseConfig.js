import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import firebaseConfigData from "../../real-time-gps-tracking.json"; 

const app = initializeApp({
  authDomain: `${firebaseConfigData.project_id}.firebaseapp.com`,
  databaseURL: firebaseConfigData.databaseURL,
  projectId: firebaseConfigData.project_id,
});

const db = getDatabase(app);

export { app, db };
