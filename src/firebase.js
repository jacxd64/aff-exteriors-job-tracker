import { initializeApp } from "firebase/app";
import {
  getFirestore,
  enableIndexedDbPersistence          // NEW
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const app = initializeApp({
  apiKey: "AIzaSyCa7kp2rC0FM2hqG6upaWCVUqSV8Q6uvUI",
  authDomain: "aff-exteriors-jobs.firebaseapp.com",
  projectId: "aff-exteriors-jobs",
  storageBucket: "aff-exteriors-jobs.firebasestorage.app",
  messagingSenderId: "721704439005",
  appId: "1:721704439005:web:ea52c17059898fba7e1f34"
});

export const db = getFirestore(app);
export const storage = getStorage(app);

// offline cache so the last data sticks in low-signal areas
enableIndexedDbPersistence(db).catch(() => {
  /* persistence already enabled / unsupported browser – safe to ignore */
});
