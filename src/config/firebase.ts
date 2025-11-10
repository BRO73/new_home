// src/config/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCkI-cejUKdK7AWEAHAcBDP5UGGzigTGU",
    authDomain: "otp-sms-58177.firebaseapp.com",
    projectId: "otp-sms-58177",
    storageBucket: "otp-sms-58177.firebasestorage.app",
    messagingSenderId: "201395098559",
    appId: "1:201395098559:web:0dbb3407ad17051628c70a",
    measurementId: "G-Y0920K5QQ3",
};

// Khởi tạo Firebase app (chỉ 1 lần duy nhất)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Export auth instance
export const auth = getAuth(app);
auth.languageCode = "vi";

export default app;