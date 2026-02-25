// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
const firebaseConfig = {
    apiKey: "AIzaSyCLCcgaoW9gNYhKk0c0gDWC6i5mKVTN4XE",
    authDomain: "profile-d1214.firebaseapp.com",
    projectId: "profile-d1214",
    storageBucket: "profile-d1214.firebasestorage.app",
    messagingSenderId: "914980131889",
    appId: "1:914980131889:web:72f8da15c42dbee671b110",
    measurementId: "G-C587M69LZW"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || 'https://hdd.io.vn/img/bmassloadings.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
