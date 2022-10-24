/* eslint-disable node/no-unsupported-features/es-syntax */
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

exports.addTagsByName = catchAsync(async (req, res, next) => {
  const doc = await Place.findById(req.params.id);
  if (!doc) {
    return next(new AppError(`No document found with that ID`, 404));
  }

  const tagsToAdd = req.query.tags.split(',');

  // eslint-disable-next-line no-restricted-syntax
  for await (const tagToAdd of tagsToAdd) {
    // Check if tag exists in tag collection and get it if exists
    const tagCandidate = await Tag.findOne({ tag: tagToAdd });

    // If tag exists and not already added to doc, add it.
    // PUNK METHOD (╯°□°）╯︵ ┻━┻ commented
    // if (tagCandidate && !JSON.stringify(doc.tags).includes(tagCandidate.id)) {
    //   doc.tags.push(tagCandidate);
    // }

    // Classic method
    if (tagCandidate && !doc.tagsString.includes(tagCandidate.tag)) {
      doc.tags.push(tagCandidate);
    }

    // If tag doesn't exist, create it in tags collection and add to document
    if (!tagCandidate) {
      const newTag = await Tag.create({ tag: tagToAdd });
      doc.tags.push(newTag);
    }
  }

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

exports.searchPlaces = catchAsync(async (req, res, next) => {
  // console.log(req.query.tags);
  // const tagString = req.query.tags.replace(/ /g, '');
  const tagString = req.query.tags ? req.query.tags.replace(/ /g, '') : '';
  const places = await Place.find({
    ...(req.query.tags ? { tagsString: { $all: tagString } } : {}),
    ...(req.query.indesc
      ? { description: new RegExp(req.query.indesc, 'i') }
      : {}),
    ...(req.query.inname ? { name: new RegExp(req.query.inname, 'i') } : {}),
  });

  res.status(200).json({
    status: 'success',
    results: places.length,
    data: places,
  });
});

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
