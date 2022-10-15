const express = require('express');
const {
  createPlace,
  getAllPlaces,
  getPlace,
  updatePlace,
  deletePlace,
  updateTags,
  swapCoords,
  searchPlaces,
} = require('../controllers/placeController');
const { protect } = require('../controllers/authController');
const { setUserIds } = require('../controllers/handlerFactory');
// const tagsRouter = require('./tagRouter');

const router = express.Router();

router.route('/search').get(searchPlaces);

router.route('/').get(getAllPlaces).post(protect, setUserIds, createPlace);

router
  .route('/:id')
  .get(getPlace)
  .patch(protect, updatePlace)
  .delete(protect, deletePlace);

//  special
router.route('/:id/tags').patch(updateTags);

router.route('/:id/swap-coords').patch(swapCoords);

module.exports = router;
