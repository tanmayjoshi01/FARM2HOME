const express = require('express');
const { getDisputes, createDispute, updateStatus } = require('../controllers/disputeController');
const { authMiddleware, roleAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/',              authMiddleware, roleAdmin,   getDisputes);     // Admin: get all
router.post('/',             authMiddleware,              createDispute);   // Buyer: file dispute
router.patch('/:id/status',  authMiddleware, roleAdmin,   updateStatus);    // Admin: update status

module.exports = router;
