// server.js - main Express server entry point.

require('dotenv').config(); // read backend/.env (PORT, MONGO_URI, JWT_SECRET)

const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const reservationRoutes = require('./routes/reservations');
const authRoutes = require('./routes/auth');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 4000;

// If the secret is missing, tokens would be unsafe: stop with a clear message.
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Copy .env.example to .env and set it.');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

// Create the two team accounts the first time the server starts,
// so you can login right away.
async function seedTeam() {
  const count = await User.countDocuments();
  if (count > 0) return;

  await User.create([
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'reception', password: 'reception123', role: 'reception' },
  ]);
  console.log('Team accounts created -> admin / admin123 and reception / reception123');
}

connectDB().then(async () => {
  await seedTeam();

  app.use('/api/auth', authRoutes);
  app.use('/api/reservations', reservationRoutes);

  app.get('/', (req, res) => {
    res.json({ message: 'Restaurant reservation API is running' });
  });

  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
  });
});
