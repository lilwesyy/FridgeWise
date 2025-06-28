const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Endpoint per PayPal IPN/Webhook
router.post('/paypal-webhook', async (req, res) => {
  try {
    // Esempio: estrai email PayPal dal body (adatta secondo payload reale)
    const email = req.body.payer_email || req.body.email || req.body.payer?.email_address;
    if (!email) return res.status(400).json({ success: false, error: 'Email non trovata nel payload PayPal' });

    // Trova utente con quell'email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, error: 'Utente non trovato' });

    // Aggiorna supporter
    user.isSupporter = true;
    await user.save();

    return res.json({ success: true, message: 'Utente aggiornato supporter!' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
