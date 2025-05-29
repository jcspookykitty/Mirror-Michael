import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = express();
app.use(cors());
app.use(express.json());

if (!process.env.PRIVATE_KEY) {
  console.error("❌ PRIVATE_KEY is missing from environment!");
  process.exit(1);
}

const serviceAccount = {
  projectId: process.env.PROJECT_ID,
  clientEmail: process.env.CLIENT_EMAIL,
  privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
};

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

app.get('/', (req, res) => {
  res.send("✅ Michael's Mirror server is running!");
});

const PORT = 10000;
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
