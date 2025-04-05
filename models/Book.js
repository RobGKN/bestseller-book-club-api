const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  googleBooksId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  authors: [{
    type: String,
  }],
  publisher: {
    type: String,
  },
  publishedDate: {
    type: Date,
  },
  description: {
    type: String,
  },
  pageCount: {
    type: Number,
  },
  categories: [{
    type: String,
  }],
  imageLinks: {
    smallThumbnail: String,
    thumbnail: String,
  },
  language: {
    type: String,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Book', BookSchema);
