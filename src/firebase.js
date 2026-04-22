import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGlmY-ior7xqv_-4PiQcs1CoePb7IDM90",
  authDomain: "collegepanel-1027b.firebaseapp.com",
  projectId: "collegepanel-1027b",
  storageBucket: "collegepanel-1027b.firebasestorage.app",
  messagingSenderId: "335340683871",
  appId: "1:335340683871:web:55cd6d24079261cd5bd1ea",
  measurementId: "G-6SX9MXW0K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const getFCMToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { 
        vapidKey: "BPERg2BAS_k4Bq2pvQc4CWQq0RJNn_OSPv-qXNSkiYnqi15qWctR8Ha8cBxki22nE7NQi5J2rL1LzDNHHT8Cf3M" 
      });
      if (token) {
        return token;
      } else {
        console.log('No registration token available. Request permission to generate one.');
        return null;
      }
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export default messaging;
