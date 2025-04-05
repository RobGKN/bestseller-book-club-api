const Review = require('../models/Review');
const Book = require('../models/Book');

// Get reviews for a book
const getBookReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ book: req.params.id })
      .populate('user', 'username name')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a review
const createReview = async (req, res) => {
  try {
    const { rating, text } = req.body;
    
    // Check if book exists
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Check if user has already reviewed this book
    const existingReview = await Review.findOne({
      user: req.user._id,
      book: req.params.id,
    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }
    
    // Create review
    const review = await Review.create({
      book: req.params.id,
      user: req.user._id,
      rating,
      text,
    });
    
    // Update book ratings
    const allReviews = await Review.find({ book: req.params.id });
    const totalRating = allReviews.reduce((acc, item) => acc + item.rating, 0);
    
    book.averageRating = totalRating / allReviews.length;
    book.reviewCount = allReviews.length;
    await book.save();
    
    // Return populated review
    const populatedReview = await Review.findById(review._id).populate(
      'user',
      'username name'
    );
    
    res.status(201).json(populatedReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const { rating, text } = req.body;
    
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user is the author of the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    review.rating = rating || review.rating;
    review.text = text || review.text;
    review.updatedAt = Date.now();
    
    const updatedReview = await review.save();
    
    // Update book ratings
    const book = await Book.findById(review.book);
    const allReviews = await Review.find({ book: review.book });
    const totalRating = allReviews.reduce((acc, item) => acc + item.rating, 0);
    
    book.averageRating = totalRating / allReviews.length;
    await book.save();
    
    // Return populated review
    const populatedReview = await Review.findById(updatedReview._id).populate(
      'user',
      'username name'
    );
    
    res.json(populatedReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user is the author of the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const bookId = review.book;
    
    await review.remove();
    
    // Update book ratings
    const book = await Book.findById(bookId);
    const allReviews = await Review.find({ book: bookId });
    
    if (allReviews.length === 0) {
      book.averageRating = 0;
      book.reviewCount = 0;
    } else {
      const totalRating = allReviews.reduce((acc, item) => acc + item.rating, 0);
      book.averageRating = totalRating / allReviews.length;
      book.reviewCount = allReviews.length;
    }
    
    await book.save();
    
    res.json({ message: 'Review removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getBookReviews,
  createReview,
  updateReview,
  deleteReview,
};
