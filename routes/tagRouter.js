const express = require('express');
const { createTag, getAllTags } = require('../controllers/tagController');
const { protect } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.route('/').get(getAllTags).post(protect, createTag);

module.exports = router;
