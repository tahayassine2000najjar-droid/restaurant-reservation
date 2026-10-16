// server.js - main Express server entry point.

const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const reservationRoutes = require('./routes/reservations');

const app = express();
const PORT = process.env.PORT || 4000;


app.use(cors());
app.use(express.json());


connectDB().then(() => {
  app.use('/api/reservations', reservationRoutes);

  
  app.get('/', (req, res) => {
    res.json({ message: 'Restaurant reservation API is running' });
  });


  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
  });
});
