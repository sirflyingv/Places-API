const express = require('express');
const { protect } = require('../controllers/authController');
const { setUserIds } = require('../controllers/handlerFactory');
const {
  getAllPlaceCollections,
  createPlaceCollection,
  getPlaceCollection,
  updatePlaceCollection,
  deletePlaceCollection,
  addPlaceToCollection,
} = require('../controllers/placeCollectionController');

const router = express.Router();

router
  .route('/')
  .get(getAllPlaceCollections)
  .post(protect, setUserIds, createPlaceCollection);

router
  .route('/:id')
  .get(getPlaceCollection)
  .patch(protect, updatePlaceCollection)
  .delete(protect, deletePlaceCollection);

router.route('/:id/add-places').post(protect, setUserIds, addPlaceToCollection);

module.exports = router;
