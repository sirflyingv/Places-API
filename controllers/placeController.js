const Place = require('../models/placeModel');
const catchAsync = require('../utils/catchAsync');
const Tag = require('../models/tagModel');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.getAllPlaces = factory.getAll(Place);
exports.createPlace = factory.createOne(Place);
exports.getPlace = factory.getOne(Place);
exports.updatePlace = factory.updateOne(Place);
exports.deletePlace = factory.deleteOne(Place);

// Add one or many tags to place
exports.addTags = catchAsync(async (req, res, next) => {
  const doc = await Place.findById(req.params.id);
  if (!doc) {
    return next(new AppError(`No document found with that ID`, 404));
  }

  const tags = await Tag.find({ _id: req.body.tags });
  doc.tags.push(...tags);

  doc.markModified('tags');
  await doc.save();

  res.status(200).json({
    status: 'success',
    data: doc,
  });
});

// Delete one or many tags from place
exports.deleteTags = catchAsync(async (req, res, next) => {
  const doc = await Place.findById(req.params.id);
  if (!doc) {
    return next(new AppError(`No document found with that ID`, 404));
  }

  doc.tags = doc.tags.filter((el) => !req.body.tags.includes(el.id));

  doc.markModified('tags');
  await doc.save();

  res.status(200).json({
    status: 'success',
    data: doc,
  });
});

// a.filter(i => b.findIndex(f => f.id === i.id))

// little helper to fix wrong coords order problem
exports.swapCoords = catchAsync(async (req, res, next) => {
  const doc = await Place.findById(req.params.id);
  if (!doc) {
    return next(new AppError(`No document found with that ID`, 404));
  }

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
  let query = Place.find();

  // checking tags in query string and making array of them
  let tagsNames;
  if (req.query.tags) tagsNames = req.query.tags.split(',');

  // adding tags to mongoose query
  let tagsToSearch;
  if (tagsNames) {
    tagsToSearch = await Tag.find({ tag: tagsNames });
    query = query.find({ tags: { $all: tagsToSearch } });
  }

  // adding string to mongoose query to search in description
  const indescSearch = req.query.indesc;
  if (indescSearch) {
    const regexpDescription = new RegExp(indescSearch, 'i');
    query = query.find({ description: regexpDescription });
  }

  // adding string to mongoose query to search in name
  const inNameSearch = req.query.inname;
  if (inNameSearch) {
    const regexpName = new RegExp(inNameSearch, 'i');
    query = query.find({ name: regexpName });
  }

  const places = await query;

  res.status(200).json({
    status: 'success',
    results: places.length,
    data: places,
  });
});
