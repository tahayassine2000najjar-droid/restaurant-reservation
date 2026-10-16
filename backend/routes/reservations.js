// routes/reservations.js - all CRUD routes for reservations.

const express = require('express');
const Reservation = require('../models/Reservation');
const { validateReservation } = require('../validation');

const router = express.Router();


const MAX_PER_SLOT = 5;


router.get('/', async (req, res) => {
  try {

    const filter = req.query.date ? { date: req.query.date } : {};

    const rows = await Reservation.find(filter).sort({ date: 1, time: 1 });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await Reservation.findById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Reservation not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});


router.post('/', async (req, res) => {
  try {
   
    const { success, data, errors } = validateReservation(req.body);
    if (!success) return res.status(400).json({ error: errors.join(', ') });

 
    const count = await Reservation.countDocuments({
      date: data.date,
      time: data.time,
      status: { $ne: 'cancelled' },
    });
    if (count >= MAX_PER_SLOT) {
      return res
        .status(400)
        .json({ error: `Slot ${data.date} ${data.time} is full (max ${MAX_PER_SLOT})` });
    }

  
    const created = await Reservation.create({
      customerName: data.customerName,
      phone: data.phone,
      email: data.email || null,
      date: data.date,
      time: data.time,
      guests: data.guests,
      notes: data.notes || null,
      status: data.status || 'pending',
    });

    res.status(201).json(created); 
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const existing = await Reservation.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Reservation not found' });


    const { success, data, errors } = validateReservation(req.body);
    if (!success) return res.status(400).json({ error: errors.join(', ') });

  
    const count = await Reservation.countDocuments({
      date: data.date,
      time: data.time,
      status: { $ne: 'cancelled' },
      _id: { $ne: req.params.id }, 
    });
    if (count >= MAX_PER_SLOT) {
      return res
        .status(400)
        .json({ error: `Slot ${data.date} ${data.time} is full (max ${MAX_PER_SLOT})` });
    }

  
    existing.customerName = data.customerName;
    existing.phone = data.phone;
    existing.email = data.email || null;
    existing.date = data.date;
    existing.time = data.time;
    existing.guests = data.guests;
    existing.notes = data.notes || null;
    existing.status = data.status || 'pending';
    await existing.save();

    res.json(existing);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Reservation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Reservation not found' });
    res.json({ message: 'Reservation deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

module.exports = router;
