const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/APIFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError(`No document found with that ID`, 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError(`No document found with that ID`, 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: doc,
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    // const doc = await Model.findById(req.params.id).populate('reviews'); // populate added for virtual population of reviews to work

    //Tour.findOne({_id: req.params.id}) - exactly same as👆, just shorthand

    if (!doc) {
      // return to finish this function execution not to have 2 responses
      return next(new AppError(`No document found with that ID`, 404));
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

// exports.getAll = (Model) =>
//   catchAsync(async (req, res, next) => {
//     const docs = await Model.find();

//     // const doc = await Model.findById(req.params.id).populate('reviews'); // populate added for virtual population of reviews to work

//     //Tour.findOne({_id: req.params.id}) - exactly same as👆, just shorthand

//     if (!docs) {
//       // return to finish this function execution not to have 2 responses
//       return next(new AppError(`No documents found`, 404));
//     }

//     res.status(200).json({
//       status: 'success',
//       results: docs.length,
//       data: docs,
//     });
//   });
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    console.log(req.params);
    // to allow nested getReviews on tour. Kinda hack
    let filter;
    if (req.params.id) filter = { tour: req.params.id };

    // EXECUTING A QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;

    // Send response
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: docs.length,
      data: {
        docs,
      },
    });
  });

exports.setUserIds = (req, res, next) => {
  // for nested routes
  // if (!req.body.tour) req.body.tour = req.params.tourId;

  console.log('req.user.id', req.user.id);

  if (!req.body.user) req.body.user = req.user.id;

  next();
};
