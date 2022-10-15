const Place = require('../models/placeModel');
const catchAsync = require('../utils/catchAsync');
const Tag = require('../models/tagModel');
// const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.getAllPlaces = factory.getAll(Place);
exports.createPlace = factory.createOne(Place);
exports.getPlace = factory.getOne(Place);
exports.updatePlace = factory.updateOne(Place);
exports.deletePlace = factory.deleteOne(Place);

exports.updateTags = catchAsync(async (req, res, next) => {
  const doc = await Place.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: doc,
  });
});

// little helper to fix wrong coords order problem
exports.swapCoords = catchAsync(async (req, res, next) => {
  const doc = await Place.findById(req.params.id);

  const [...coords] = doc.location.coordinates;
  doc.location.coordinates[0] = coords[1];
  doc.location.coordinates[1] = coords[0];

  doc.markModified('location'); // without this, nothing saves. Attention that markModified is used on first child - location, not coordinates themselves
  await doc.save();

  res.status(200).json({
    status: 'success',
    data: doc,
  });
});

exports.searchPlaces = catchAsync(async (req, res, next) => {
  // Search by tags
  // getting tags from URL
  const tagsNames = req.query.tags.split(',');
  const tags = await Tag.find({ tag: tagsNames });
  // searching for places by tags
  const places = await Place.find({
    tags: { $all: tags },
  });

  res.status(200).json({
    status: 'success',
    results: places.length,
    data: places,
  });
});
