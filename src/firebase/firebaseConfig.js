// Import the Firebase SDK modules
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBcG5aRC0ALiwpXJuNBwBLWQ47vG0j-LZE",
  authDomain: "spendmate-92afa.firebaseapp.com",
  databaseURL: "https://spendmate-92afa-default-rtdb.firebaseio.com/", // Ensure Realtime DB URL is present
  projectId: "spendmate-92afa",
  storageBucket: "spendmate-92afa.appspot.com",
  messagingSenderId: "325330549990",
  appId: "1:325330549990:web:9fa6bd71887f6726bdcf27",
  measurementId: "G-WD70H9MX8S",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Authentication with AsyncStorage for persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Realtime Database
const db = getDatabase(app);

// Export initialized services
export { app, auth, db };
