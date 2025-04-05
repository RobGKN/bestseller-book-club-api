const axios = require('axios');
const Book = require('../models/Book');

// Search books from Google Books API
const searchBooks = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Search Google Books API
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${process.env.GOOGLE_BOOKS_API_KEY}`
    );
    
    if (!response.data.items) {
      return res.json({ books: [] });
    }
    
    // Format response
    const books = response.data.items.map(item => ({
      googleBooksId: item.id,
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors || ['Unknown Author'],
      publisher: item.volumeInfo.publisher,
      publishedDate: item.volumeInfo.publishedDate,
      description: item.volumeInfo.description,
      pageCount: item.volumeInfo.pageCount,
      categories: item.volumeInfo.categories,
      imageLinks: item.volumeInfo.imageLinks,
      language: item.volumeInfo.language,
    }));
    
    res.json({ books });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get book by ID (local DB or Google Books)
const getBookById = async (req, res) => {
  try {
    const bookId = req.params.id;
    
    // First try to find in our DB by ObjectId
    let book = null;
    
    if (bookId.match(/^[0-9a-fA-F]{24}$/)) {
      book = await Book.findById(bookId);
    }
    
    // If not found, try to find by Google Books ID
    if (!book) {
      book = await Book.findOne({ googleBooksId: bookId });
    }
    
    // If still not found, fetch from Google Books API and save
    if (!book) {
      try {
        const response = await axios.get(
          `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${process.env.GOOGLE_BOOKS_API_KEY}`
        );
        
        const item = response.data;
        
        book = new Book({
          googleBooksId: item.id,
          title: item.volumeInfo.title,
          authors: item.volumeInfo.authors || ['Unknown Author'],
          publisher: item.volumeInfo.publisher,
          publishedDate: item.volumeInfo.publishedDate,
          description: item.volumeInfo.description,
          pageCount: item.volumeInfo.pageCount,
          categories: item.volumeInfo.categories,
          imageLinks: item.volumeInfo.imageLinks,
          language: item.volumeInfo.language,
        });
        
        await book.save();
      } catch (error) {
        return res.status(404).json({ message: 'Book not found' });
      }
    }
    
    res.json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get top-rated books
const getTopBooks = async (req, res) => {
  try {
    const books = await Book.find({})
      .sort({ averageRating: -1 })
      .limit(10);
    
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  searchBooks,
  getBookById,
  getTopBooks,
};
