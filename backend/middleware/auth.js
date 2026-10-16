// middleware/auth.js - protects the team routes.
// The client must send: Authorization: Bearer <token>

const jwt = require('jsonwebtoken');

function requireTeam(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: 'Login required' });

  try {
    // If the token is valid we keep its info: { username, role }
    req.team = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired, please login again' });
  }
}

module.exports = requireTeam;
