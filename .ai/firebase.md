// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDX0NcDxb-qvXjSRoi_styzDJSJIacWa_c",
  authDomain: "plemiona-bot-notifica-220925.firebaseapp.com",
  projectId: "plemiona-bot-notifica-220925",
  storageBucket: "plemiona-bot-notifica-220925.firebasestorage.app",
  messagingSenderId: "337582008506",
  appId: "1:337582008506:web:e6cd3695ce464bdcda7a83",
  measurementId: "G-EJWKV3SPB0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);












Wygenerowany klucz to Twój klucz VAPID (publiczny). Skopiuj go – będzie potrzebny w kodzie Vue do subskrypcji powiadomień.
BNt236vYsH2SVytbY94LhIAFpPU_7orEl0LkbRCRZiPuhEO36QznX1_Kxv1VsLlrmPPnSlaeFrE9-pEaSny2Xcg