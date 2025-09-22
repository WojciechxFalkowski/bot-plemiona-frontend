importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDX0NcDxb-qvXjSRoi_styzDJSJIacWa_c",
  authDomain: "plemiona-bot-notifica-220925.firebaseapp.com",
  projectId: "plemiona-bot-notifica-220925",
  storageBucket: "plemiona-bot-notifica-220925.firebasestorage.app",
  messagingSenderId: "337582008506",
  appId: "1:337582008506:web:e6cd3695ce464bdcda7a83",
  measurementId: "G-EJWKV3SPB0"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
