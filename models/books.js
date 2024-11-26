const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  publishedDate: Date,
  description: String,
  isbn: String,
  genre: String,
  cover: String,
  pages: Number,
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // This being false allows guest profiles to make lists.
    required: false,
  },
//   allows us to track guest session books
  sessionId: {
    type: String,
    required: false,
  },
});

const Book = mongoose.model("Book", bookSchema);
module.exports = Book;
