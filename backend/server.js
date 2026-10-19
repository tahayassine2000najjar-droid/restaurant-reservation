

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const reservationRoutes = require('./routes/reservations');
const authRoutes = require('./routes/auth');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 4000;


if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Copy .env.example to .env and set it.');
  process.exit(1);
}

app.use(cors());
app.use(express.json());


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
