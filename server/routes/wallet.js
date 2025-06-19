const express = require('express');
const router = express.Router();
const { createWallet, getWallet, depositFiat, withdrawCrypto } = require('../controllers/walletController');
const auth = require('../middleware/auth');

// @route   POST api/wallet
// @desc    Create wallet
router.post('/', auth, createWallet);

// @route   GET api/wallet
// @desc    Get wallet
router.get('/', auth, getWallet);

// @route   POST api/wallet/deposit/fiat
// @desc    Deposit fiat (NGN) via Flutterwave or manual
router.post('/deposit/fiat', auth, depositFiat);

// @route   POST api/wallet/withdraw/crypto
// @desc    Withdraw crypto (MZLx, USDT) to external wallet
router.post('/withdraw/crypto', auth, withdrawCrypto);

module.exports = router;
