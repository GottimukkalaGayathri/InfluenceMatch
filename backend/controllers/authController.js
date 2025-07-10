const db = require('../db');
const { v4: uuidv4 } = require('uuid');

exports.signup = (req, res) => {
  const { name, email, password, role, website } = req.body;
  const id = uuidv4();

  if (role === 'brand') {
    // If role is brand, send a request to admin
    const requestId = uuidv4();
    const sql = `
      INSERT INTO brand_requests (id, name, email, website, status, created_at)
      VALUES (?, ?, ?, ?, 'pending', NOW())
    `;

    db.query(sql, [requestId, name, email, website], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: '✅ Brand request submitted. Wait for admin approval.' });
    });

  } else {
    // Normal influencer or admin signup
    const sql = `
      INSERT INTO users (id, name, email, password, role, status)
      VALUES (?, ?, ?, ?, ?, 'active')
    `;

    db.query(sql, [id, name, email, password, role], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id, name, email, role });
    });
  }
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  const sql = `SELECT * FROM users WHERE email = ? AND password = ?`;
  db.query(sql, [email, password], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result[0];
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
  });
};
