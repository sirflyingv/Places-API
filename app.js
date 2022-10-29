const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const cors = require('cors');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const placeRouter = require('./routes/placeRoutes');
const tagsRouter = require('./routes/tagRouter');
const placeCollectionRouter = require('./routes/placeCollectionRouter');

const app = express();

// 1) GLOBAL MIDDLEWARES

// test CORS (without parameters - all open)
app.use(cors());

// Set security http headers
app.use('/api', helmet());

// Developement logging
console.log(process.env.NODE_ENV, 'process.env.NODE_ENV 😎');
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// limiting request from one IP. Info will be in headers of response
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});
app.use('/api', limiter);

// Body parser - reading data from body into req.body
app.use(express.json({ limit: '10Kb' }));

// Data sanitization against NoSQL query injection and cross-site scripts (XSS)
app.use(mongoSanitize());
app.use(xss());

// Prevent query parameters pollution (with whitelist of properties that can be used multiple times in query)
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Sets /public folder as root for static file request
app.use(express.static(`${__dirname}/public/`));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});
// testing headers
app.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  });
  next();
});

// 2) ROUTES

app.use('/api/v1/users', userRouter);
app.use('/api/v1/places', placeRouter);
app.use('/api/v1/tags', tagsRouter);
app.use('/api/v1/place-collections', placeCollectionRouter);

// catching all wrong routes uncaught by routers ⬆
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); // when there is argument in next(), express automatically understand that's an error and send it to error handling middleware, skip all other middleware
});

// ERROR HANDLING MIDDLEWARE
// when 4 parameters, Express automatically knows that it is error handling middleware
app.use(globalErrorHandler);

module.exports = app;
