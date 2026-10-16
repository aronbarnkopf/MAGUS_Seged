import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyB6Jqikh48JSkfwliWX_5OHF8o_J9adNP4",
    authDomain: "magus-seged.firebaseapp.com",
    projectId: "magus-seged",
    storageBucket: "magus-seged.firebasestorage.app",
    messagingSenderId: "862358644984",
    appId: "1:862358644984:web:a88ab13d0d219c442af30d"
};

import { getFirestore } from "firebase/firestore";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
