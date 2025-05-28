import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import speakRoute from './routes/speak.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/speak', speakRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mirror Michael is live on port ${PORT}`);
});
