const express = require('express');
const router  = express.Router();
const { getPublicPlans } = require('../services/provisionService');

router.get('/', (req, res) => {
    try {
        return res.json({ data: { plans: getPublicPlans() } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching plans.' });
    }
});

module.exports = router;
