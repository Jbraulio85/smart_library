import path from "path";
import { readFileSync } from "fs";
import admin from "firebase-admin";


const serviceAccountPath = path.resolve(
  process.cwd(), 
  "credentials/angelic-mender-463122-u1-5cf679394ade.json"
);

const serviceAccount = JSON.parse(
  readFileSync(serviceAccountPath, "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "biblioteca-inteligente",
});

const bucket = admin.storage().bucket();
export default bucket;
