const Tag = require('../models/tagModel');
// const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.getAllTags = factory.getAll(Tag);
exports.createTag = factory.createOne(Tag);
