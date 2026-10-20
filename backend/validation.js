

const { z } = require('zod');

const optionalText = z.string().trim().optional().or(z.literal(''));


const reservationSchema = z.object({
  customerName: z.string().trim().min(1, 'customerName is required'),
  phone: z
    .string()
    .trim()
    .min(1, 'phone is required')
    .refine((v) => {
      const digits = v.replace(/\D/g, '');
      return /^[+\d\s\-()]+$/.test(v) && digits.length >= 7 && digits.length <= 15;
    }, 'phone format is invalid'),
 
  email: z
    .string()
    .trim()
    .refine((v) => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'email format is invalid')
    .optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date is required (YYYY-MM-DD)')
    .refine((v) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const chosen = new Date(v + 'T00:00:00');
      return !isNaN(chosen) && chosen >= today;
    }, 'date cannot be in the past'),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'time must be HH:mm')
    .refine((v) => {
     
      const [h, m] = v.split(':').map(Number);
      const minutes = h * 60 + m;
      return minutes >= 8 * 60 && minutes <= 20 * 60;
    }, 'time must be between 08:00 and 20:00'),
  guests: z.coerce
    .number()
    .int('guests must be a whole number')
    .min(1, 'guests must be from 1 to 20')
    .max(20, 'guests must be from 1 to 20'),
  notes: z.string().trim().max(500, 'notes must be 500 characters or less').optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
});


function validateReservation(body) {
  const result = reservationSchema.safeParse(body);
  if (result.success) return { success: true, data: result.data };


  const errors = result.error.issues.map((i) => i.message);
  return { success: false, errors };
}

module.exports = { validateReservation };
