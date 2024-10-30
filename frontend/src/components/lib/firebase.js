
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import {getStorage} from "firebase/storage";

const firebaseConfig = {
  apiKey:import.meta.env.VITE_API_KEY,
  authDomain: "chat-application-d4ddf.firebaseapp.com",
  projectId: "chat-application-d4ddf",
  storageBucket: "chat-application-d4ddf.appspot.com",
  messagingSenderId: "363381118151",
  appId: "1:363381118151:web:be4daa3c8fd4bdf26c9ae2"
};

const app = initializeApp(firebaseConfig);
  
export const auth=getAuth(app);
export const db=getFirestore(app); 
export const storage=getStorage(app);