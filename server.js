const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION!!! 💥💥💥');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({
  path: './config.env',
});
const app = require('./app');
// const { listenerCount } = require('./models/tourModel');

const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    authSource: 'admin',
  })
  .then(() => console.log('DB connection successful! 😎'));

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  const fullMessage = err.message;

  const inStrObjStart = fullMessage.indexOf('{');
  const inStrObjEnd = fullMessage.indexOf('}');

  const inStrObj = fullMessage
    .slice(inStrObjStart, inStrObjEnd + 1)
    .replace(/ /g, '')
    .replace(/\r?\n|\r/g, '');

  const codeNamePropNameIndex = inStrObj.indexOf('codeName');
  const codeNameDirty = inStrObj.slice(codeNamePropNameIndex + 10);
  const codeNameClean = codeNameDirty.slice(0, codeNameDirty.indexOf("'"));
  console.log(err.name, codeNameClean);
  console.log('Unhandled rejection, shutting down...');
  server.close(() => {
    process.exit(1); // putting it here so we don't just crash the app, but first stop all request
  });
});
