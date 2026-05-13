import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";
import fs from "fs";

const envLocal = fs.readFileSync(".env.local", "utf-8");
const env = {};
envLocal.split("\n").forEach(line => {
  if (line && line.includes("=")) {
    const parts = line.split("=");
    const key = parts[0].trim();
    const value = parts.slice(1).join("=").trim().replace(/['"]/g, "");
    env[key] = value;
  }
});

const firebaseConfig = {
  apiKey: env["NEXT_PUBLIC_FIREBASE_API_KEY"],
  authDomain: env["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"],
  databaseURL: env["NEXT_PUBLIC_FIREBASE_DATABASE_URL"],
  projectId: env["NEXT_PUBLIC_FIREBASE_PROJECT_ID"],
  storageBucket: env["NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"],
  messagingSenderId: env["NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"],
  appId: env["NEXT_PUBLIC_FIREBASE_APP_ID"],
};

console.log("Testing Firebase connection...");
console.log("URL:", firebaseConfig.databaseURL);

try {
    const app = initializeApp(firebaseConfig);
    const rtdb = getDatabase(app, firebaseConfig.databaseURL);
    const refRoot = ref(rtdb, "/");

    get(refRoot).then((snapshot) => {
      if (snapshot.exists()) {
        console.log("✅ Data found at root. Keys available:");
        const val = snapshot.val();
        console.log(Object.keys(val));
        console.log(JSON.stringify(val, null, 2));
      } else {
        console.log("❌ Database is completely EMPTY");
      }
      process.exit(0);
    }).catch((error) => {
      console.error("❌ Error fetching data:", error.message);
      process.exit(1);
    });
} catch (e) {
    console.error("❌ Init error:", e);
    process.exit(1);
}
