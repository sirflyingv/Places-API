const express = require('express');
const { createTag, getAllTags } = require('../controllers/tagController');
const { protect } = require('../controllers/authController');
const { setUserIds } = require('../controllers/handlerFactory');

const router = express.Router({ mergeParams: true });

router.route('/').get(getAllTags).post(protect, setUserIds, createTag);
// router
//   .route('/:id')
//   .get(getPlace)
//   .patch(protect, updatePlace)
//   .delete(protect, deletePlace);

module.exports = router;
