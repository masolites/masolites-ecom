const express = require('express');
const router = express.Router();
const { getICOInfo, participateICO } = require('../controllers/icoController');
const auth = require('../middleware/auth');

// @route   GET api/ico
// @desc    Get ICO information
router.get('/', getICOInfo);

// @route   POST api/ico/participate
// @desc    Participate in ICO
router.post('/participate', auth, participateICO);

module.exports = router;
