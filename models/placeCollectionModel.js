const mongoose = require('mongoose');

const placeCollectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A collection must have a name'],
    unique: true,
    maxLength: 120,
  },
  description: {
    type: String,
    maxLength: 5000,
  },
  photo: {
    type: String,
  },
  places: [{ type: mongoose.Schema.ObjectId, ref: 'Place' }],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Place must have and author'],
  },
});

placeCollectionSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'places',
    select: 'name -tags ',
  });
  next();
});

const PlaceCollection = mongoose.model(
  'PlaceCollection',
  placeCollectionSchema
);

module.exports = PlaceCollection;
