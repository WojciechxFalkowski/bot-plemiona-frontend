// src/firebaseConfig.ts
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getMessaging, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDX0NcDxb-qvXjSRoi_styzDJSJIacWa_c",
  authDomain: "plemiona-bot-notifica-220925.firebaseapp.com",
  projectId: "plemiona-bot-notifica-220925",
  storageBucket: "plemiona-bot-notifica-220925.firebasestorage.app",
  messagingSenderId: "337582008506",
  appId: "1:337582008506:web:e6cd3695ce464bdcda7a83",
  measurementId: "G-EJWKV3SPB0"
};

// Inicjalizujemy aplikację i eksportujemy instancje
const app: FirebaseApp = initializeApp(firebaseConfig);
const messaging: Messaging = getMessaging(app);

export { messaging };
