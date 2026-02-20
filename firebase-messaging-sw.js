importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Cấu hình giống hệt trong file index.html
firebase.initializeApp({
    apiKey: "AIzaSyCLCcgaoW9gNYhKk0c0gDWC6i5mKVTN4XE", 
    authDomain: "profile-d1214.firebaseapp.com",
    projectId: "profile-d1214",
    storageBucket: "profile-d1214.firebasestorage.app",
    messagingSenderId: "914980131889",
    appId: "1:914980131889:web:72f8da15c42dbee671b110"
});

const messaging = firebase.messaging();

// Xử lý thông báo khi app đang chạy ngầm (Background)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/img/bmasslogos.png' // Đường dẫn icon của bạn
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
