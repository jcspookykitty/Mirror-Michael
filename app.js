const express = require('express');
const speakRoute = require('./routes/speak');
const app = express();

app.use(express.json());
app.use('/speak', speakRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Mirror Michael listening on port ${PORT}`));
