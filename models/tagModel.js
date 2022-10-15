const mongoose = require('mongoose');
// const validator = require('validator');

const tagSchema = new mongoose.Schema({
  tag: {
    type: String,
    required: [true, 'A tag must have a name'],
  },
});

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
