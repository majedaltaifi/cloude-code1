import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// NIT Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCavTcaDYVcW_lfF0YwvmnUCZH_PcuwFck",
    authDomain: "cloude-code1.firebaseapp.com",
    projectId: "cloude-code1",
    storageBucket: "cloude-code1.firebasestorage.app",
    messagingSenderId: "553630040386",
    appId: "1:553630040386:web:361da3353836ac709188db",
    measurementId: "G-GJ65XRZ57B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
