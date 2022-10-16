const mongoose = require('mongoose');
// const AppError = require('../utils/appError');
// const validator = require('validator');

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A place must have a name'],
    },
    description: {
      type: String,
      required: [true, 'A place must have a description'],
    },
    address: String,
    tags: [{ type: mongoose.Schema.ObjectId, ref: 'Tag' }],
    tagsString: [String],
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Place must have and author'],
    },
    location: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point', 'LineString', 'Polygon'],
      },
      coordinates: [Number],
      locationDescription: String,
    },
  },
  { toJSON: { virtuals: true } },
  { toObject: { virtuals: true } }
);

// making simple tags array from nested refs
// placeSchema.virtual('tagsArray').get(function () {
//   const array = this.tags.map((el) => el.tag);
//   return array;
// });

placeSchema.virtual('geoType').get(function () {
  if (this.location.type === 'Point') return 'Point';
  if (this.location.type === 'LineString') return 'Way';
  if (this.location.type === 'Polygon') return 'Area';
});

placeSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'tags',
    select: '-__v',
  });
  next();
});

placeSchema.pre('save', function (next) {
  this.tagsString = this.tags.map((tag) => tag.tag);
  next();
});

const Place = mongoose.model('Place', placeSchema);

module.exports = Place;
