const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');


router.post('/', verifyToken, reportController.createReport);
router.get('/my-reports', verifyToken, reportController.getUserReports);
router.get('/all', verifyToken, verifyAdmin, reportController.getAllReports);

module.exports = router;