
// backend/src/index.js
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Reverse Proxy Visualizer backend ready' });
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Backend server listening on ${PORT}`);
});



