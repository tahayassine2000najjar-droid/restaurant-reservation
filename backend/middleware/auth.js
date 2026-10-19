

const jwt = require('jsonwebtoken');

function requireTeam(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: 'Login required' });

  try {
   
    req.team = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired, please login again' });
  }
}

module.exports = requireTeam;
