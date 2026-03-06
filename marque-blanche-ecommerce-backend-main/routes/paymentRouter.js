const router = require('express').Router();

const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/Auth');

// creating client secret — client must be authenticated
router.post('/create-payment-intent', auth.checkClientAuthentication, paymentController);

module.exports = router;