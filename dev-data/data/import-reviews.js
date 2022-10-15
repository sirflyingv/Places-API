const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Review = require('../../models/reviewModel');

dotenv.config({
  path: './config.env',
});

const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    authSource: 'admin',
  })
  .then(() => console.log('DB connection successful! 😎'));

// read JSON file

const reviews = JSON.parse(
  fs.readFileSync('dev-data/data/reviews.json', 'utf-8')
);

// import data into DB
const importData = async () => {
  try {
    await Review.create(reviews);
    console.log('Data successfully loaded 😘😘😘');
  } catch (error) {
    console.error(error);
  }
  process.exit();
};

//  Delete all data from db
const deleteData = async () => {
  try {
    await Review.deleteMany();
    console.log('Data successfully deleted 😁👌');
  } catch (error) {
    console.error(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
console.log(process.argv);
