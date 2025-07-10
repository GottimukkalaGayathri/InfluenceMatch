const db = require('../db');
const { v4: uuidv4 } = require('uuid');

exports.createCampaign = (req, res) => {
  const { title, description, platform, brand_id } = req.body;
  const id = uuidv4();

  const sql = `
    INSERT INTO campaigns (id, title, description, platform, brand_id, status, created_at)
    VALUES (?, ?, ?, ?, ?, 'draft', NOW())
  `;

  db.query(sql, [id, title, description, platform, brand_id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: '✅ Campaign created successfully', campaign_id: id });
  });
};

exports.getBrandCampaigns = (req, res) => {
  const brandId = req.params.brandId;

  const sql = `
    SELECT id, title, description, platform, status, created_at
    FROM campaigns
    WHERE brand_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [brandId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};

exports.applyToCampaign = (req, res) => {
  const { influencer_id, campaign_id } = req.body;
  const id = uuidv4();

  const checkSQL = `
    SELECT * FROM campaign_applications
    WHERE influencer_id = ? AND campaign_id = ?
  `;

  db.query(checkSQL, [influencer_id, campaign_id], (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    if (existing.length > 0) {
      return res.status(400).json({ error: 'You have already applied to this campaign' });
    }

    const insertSQL = `
      INSERT INTO campaign_applications (id, influencer_id, campaign_id, status, applied_at)
      VALUES (?, ?, ?, 'applied', NOW())
    `;

    db.query(insertSQL, [id, influencer_id, campaign_id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: '✅ Application submitted' });
    });
  });
};

exports.getBrandApplications = (req, res) => {
  const brandId = req.params.brandId;

  const sql = `
    SELECT 
      ca.id AS application_id,
      ca.status,
      ca.applied_at,
      u.id AS influencer_id,
      u.name AS influencer_name,
      u.email AS influencer_email,
      sm.platform,
      sm.handle,
      sm.followers,
      c.title AS campaign_title,
      c.platform AS campaign_platform
    FROM campaign_applications ca
    JOIN users u ON ca.influencer_id = u.id
    JOIN campaigns c ON ca.campaign_id = c.id
    LEFT JOIN social_media sm ON sm.user_id = u.id
    WHERE c.brand_id = ?
    ORDER BY ca.applied_at DESC
  `;

  db.query(sql, [brandId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const grouped = {};

    results.forEach(row => {
      if (!grouped[row.application_id]) {
        grouped[row.application_id] = {
          application_id: row.application_id,
          status: row.status,
          applied_at: row.applied_at,
          influencer_id: row.influencer_id,
          influencer_name: row.influencer_name,
          influencer_email: row.influencer_email,
          campaign_title: row.campaign_title,
          campaign_platform: row.campaign_platform,
          social_media: []
        };
      }

      if (row.platform) {
        grouped[row.application_id].social_media.push({
          platform: row.platform,
          handle: row.handle,
          followers: row.followers
        });
      }
    });

    res.status(200).json(Object.values(grouped));
  });
};

exports.approveApplication = (req, res) => {
  const applicationId = req.params.applicationId;

  const sql = `UPDATE campaign_applications SET status = 'approved' WHERE id = ?`;

  db.query(sql, [applicationId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: '✅ Application approved' });
  });
};

exports.rejectApplication = (req, res) => {
  const applicationId = req.params.applicationId;

  const sql = `UPDATE campaign_applications SET status = 'rejected' WHERE id = ?`;

  db.query(sql, [applicationId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: '❌ Application rejected' });
  });
};
