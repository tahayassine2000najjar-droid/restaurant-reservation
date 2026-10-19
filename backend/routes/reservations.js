

const express = require('express');
const Reservation = require('../models/Reservation');
const { validateReservation } = require('../validation');
const requireTeam = require('../middleware/auth');

const router = express.Router();


const MAX_PER_SLOT = 5;


function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// A short code given to the guest (like a ticket number): R-7K2QM
// Letters and digits only, no confusing 0/O or 1/I.
function makeBookingCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return 'R-' + code;
}

// The phone with only its digits, so "+1 555 123 4567" and "1555 1234567"
// are found with the same search.
function digitsOf(phone) {
  return String(phone).replace(/\D/g, '');
}

// What a GUEST is allowed to see about a reservation (no phone, no notes:
// those stay private to the team).
function guestView(row) {
  return {
    id: row._id,
    bookingCode: row.bookingCode,
    customerName: row.customerName,
    date: row.date,
    time: row.time,
    guests: row.guests,
    status: row.status,
  };
}


router.get('/', requireTeam, async (req, res) => {
  try {
    const { date, search } = req.query;

    const filter = {};
    if (date) filter.date = date;
    if (search) filter.customerName = { $regex: escapeRegex(String(search)), $options: 'i' };

    const rows = await Reservation.find(filter).sort({ date: 1, time: 1 });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// PUBLIC: the guest finds HIS OWN reservations with his phone number
// (+ the booking code if he has one). Works on any device, no login.
// GET /api/reservations/track?phone=0612345678&code=R-7K2QM  (code optional)
router.get('/track', async (req, res) => {
  try {
    const digits = digitsOf(req.query.phone || '');
    if (digits.length < 7 || digits.length > 15) {
      return res.status(400).json({ error: 'phone is required (7-15 digits)' });
    }

    const filter = { phoneDigits: digits };
    const code = String(req.query.code || '').trim().toUpperCase();
    if (code) filter.bookingCode = code;

    const rows = await Reservation.find(filter).sort({ date: 1, time: 1 });
    res.json(rows.map(guestView));
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
      phoneDigits: digitsOf(data.phone),  // so the guest can find it back
      bookingCode: makeBookingCode(),     // ticket number given to the guest
      email: data.email || null,
      date: data.date,
      time: data.time,
      guests: data.guests,
      notes: data.notes || null,
      status: 'pending', 
    });

    // The guest only gets his own view (with his bookingCode to track it).
    res.status(201).json(guestView(created));
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});


// PUBLIC: the guest cancels HIS OWN request while it is still "pending".
// The phone of the body must match the phone of the reservation.
// PATCH /api/reservations/:id/cancel  { phone: "0612345678" }
router.patch('/:id/cancel', async (req, res) => {
  try {
    const row = await Reservation.findById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Reservation not found' });

    const phone = String((req.body || {}).phone || '');
    if (digitsOf(phone) !== row.phoneDigits) {
      return res.status(403).json({ error: 'This phone number does not match the reservation' });
    }
    if (row.status !== 'pending') {
      return res.status(400).json({ error: 'Only a pending reservation can be cancelled' });
    }

    row.status = 'cancelled';
    await row.save();
    res.json(guestView(row));
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});


router.patch('/:id/status', requireTeam, async (req, res) => {
  try {
    const { status } = req.body || {};
    if (status !== 'confirmed' && status !== 'cancelled') {
      return res.status(400).json({ error: 'status must be "confirmed" or "cancelled"' });
    }

    const row = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!row) return res.status(404).json({ error: 'Reservation not found' });

    res.json(row);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});


router.put('/:id', requireTeam, async (req, res) => {
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
    existing.phoneDigits = digitsOf(data.phone); // keep the guest tracking working
    existing.email = data.email || null;
    existing.date = data.date;
    existing.time = data.time;
    existing.guests = data.guests;
    existing.notes = data.notes || null;
    existing.status = data.status || existing.status; 
    await existing.save();

    res.json(existing);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});


router.delete('/:id', requireTeam, async (req, res) => {
  try {
    const deleted = await Reservation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Reservation not found' });
    res.json({ message: 'Reservation deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

module.exports = router;
