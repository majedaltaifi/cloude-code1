importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyCavTcaDYVcW_lfF0YwvmnUCZH_PcuwFck",
    authDomain: "cloude-code1.firebaseapp.com",
    projectId: "cloude-code1",
    storageBucket: "cloude-code1.firebasestorage.app",
    messagingSenderId: "553630040386",
    appId: "1:553630040386:web:361da3353836ac709188db"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: './icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
