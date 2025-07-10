const db = require('../db');
const { v4: uuidv4 } = require('uuid');

exports.getAllRequests = (req, res) => {
  const sql = 'SELECT * FROM brand_requests ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};

exports.approveRequest = (req, res) => {
  const requestId = req.params.id;

  db.query('SELECT * FROM brand_requests WHERE id = ?', [requestId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Request not found' });

    const request = results[0];
    const userId = uuidv4();

    db.query('SELECT * FROM users WHERE email = ?', [request.email], (err, existing) => {
      if (err) return res.status(500).json({ error: err.message });

      if (existing.length > 0) {
        return res.status(409).json({ error: 'Email already exists in users' });
      }

      const insertUser = `
        INSERT INTO users (id, name, email, password, role, status)
        VALUES (?, ?, ?, ?, 'brand', 'active')
      `;

      db.query(insertUser, [userId, request.name, request.email, 'defaultpass'], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        db.query(
          'UPDATE brand_requests SET status = "approved" WHERE id = ?',
          [requestId],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: '✅ Brand request approved and user added' });
          }
        );
      });
    });
  });
};

exports.rejectRequest = (req, res) => {
  const requestId = req.params.id;
  const sql = 'UPDATE brand_requests SET status = "rejected" WHERE id = ?';
  db.query(sql, [requestId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: '❌ Brand request rejected' });
  });
};
