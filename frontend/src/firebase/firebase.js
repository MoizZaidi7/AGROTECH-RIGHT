// Import the Firebase libraries you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// Your Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyA4_4Ov4lTVtHivD32PC-tD4eeAVGJwLVI",
    authDomain: "agrotech-77.firebaseapp.com",
    projectId: "agrotech-77",
    storageBucket: "agrotech-77.firebasestorage.app",
    messagingSenderId: "348341466248",
    appId: "1:348341466248:web:436ec9181ae0cd0c4ddb3d"
  };
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Export authentication instance
const auth = getAuth(app);
export { auth };