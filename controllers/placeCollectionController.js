const PlaceCollection = require('../models/placeCollectionModel');
const Place = require('../models/placeModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.getAllPlaceCollections = factory.getAll(PlaceCollection);
exports.createPlaceCollection = factory.createOne(PlaceCollection);
exports.getPlaceCollection = factory.getOne(PlaceCollection);
exports.updatePlaceCollection = factory.updateOne(PlaceCollection);
exports.deletePlaceCollection = factory.deleteOne(PlaceCollection);

exports.addPlaceToCollection = catchAsync(async (req, res, next) => {
  const doc = await PlaceCollection.findById(req.params.id);
  if (!doc) {
    return next(new AppError(`No document found with that ID`, 404));
  }
  const placesToAdd = await Place.find({ _id: req.body.places });
  console.log(placesToAdd);
  doc.places.push(...placesToAdd);

  doc.markModified('places');
  await doc.save();

  res.status(200).json({
    status: 'success',
    data: doc,
  });
});
