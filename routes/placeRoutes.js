const express = require('express');
const {
  createPlace,
  getAllPlaces,
  getPlace,
  updatePlace,
  deletePlace,
  addTags,
  addTagsByName,
  deleteTags,
  swapCoords,
  searchPlaces,
} = require('../controllers/placeController');
const { protect } = require('../controllers/authController');
const { setUserIds } = require('../controllers/handlerFactory');

const router = express.Router();

router.route('/search').get(searchPlaces);

router.route('/').get(getAllPlaces).post(protect, setUserIds, createPlace);

router
  .route('/:id')
  .get(getPlace)
  .patch(protect, updatePlace)
  .delete(protect, deletePlace);

//  special
router.route('/:id/tags').patch(addTags).delete(deleteTags);
router.route('/:id/add-tags-by-name').patch(addTagsByName);

router.route('/:id/swap-coords').patch(swapCoords);

module.exports = router;
