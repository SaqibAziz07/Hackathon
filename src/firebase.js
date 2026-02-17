import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "pitch-craft-a20f2.firebaseapp.com",
  projectId: "pitch-craft-a20f2",
  storageBucket: "pitch-craft-a20f2.firebasestorage.app",
  messagingSenderId: "912823133018",
  appId: "1:912823133018:web:0b46413e38559cd2014963",
  measurementId: "G-4EMWVMF2ZL",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
