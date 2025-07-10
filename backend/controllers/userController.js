const db = require('../db');
const { v4: uuidv4 } = require('uuid');

exports.getAllUsers = (req, res) => {
  const sql = `SELECT id, name, email, role, status FROM users`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};

exports.updateSocialMedia = (req, res) => {
  const userId = req.params.id;
  const platforms = req.body;

  const deleteOld = 'DELETE FROM social_media WHERE user_id = ?';
  db.query(deleteOld, [userId], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    const entries = [];

    for (const platform in platforms) {
      const { handle, followers } = platforms[platform];
      if (handle && followers !== undefined) {
        const id = uuidv4();
        entries.push([id, userId, platform, handle, followers]);
      }
    }

    if (entries.length === 0) {
      return res.status(400).json({ error: 'No valid platform data provided' });
    }

    const insertSQL = `
      INSERT INTO social_media (id, user_id, platform, handle, followers)
      VALUES ?
    `;

    db.query(insertSQL, [entries], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json({ message: '✅ Social media updated successfully' });
    });
  });
};

exports.getInfluencerProfile = (req, res) => {
  const userId = req.params.id;

  const sqlUser = 'SELECT id, name, email, role FROM users WHERE id = ? AND role = "influencer"';
  const sqlSocial = 'SELECT platform, handle, followers FROM social_media WHERE user_id = ?';

  db.query(sqlUser, [userId], (err, userResult) => {
    if (err) return res.status(500).json({ error: err.message });
    if (userResult.length === 0) return res.status(404).json({ error: 'Influencer not found' });

    const user = userResult[0];

    db.query(sqlSocial, [userId], (err, socialResult) => {
      if (err) return res.status(500).json({ error: err.message });
      user.social_media = socialResult;
      res.status(200).json(user);
    });
  });
};
