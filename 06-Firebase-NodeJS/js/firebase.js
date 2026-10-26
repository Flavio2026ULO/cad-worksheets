import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "COLA-AQUI",
  authDomain: "cad-2022109866.firebaseapp.com",
  databaseURL: "https://cad-2022109866-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "cad-2022109866",
  storageBucket: "cad-2022109866.firebasestorage.app",
  messagingSenderId: "COLA-AQUI",
  appId: "COLA-AQUI"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);