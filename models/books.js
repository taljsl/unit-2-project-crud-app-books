const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    publishedDate: Date,
    description: String,
    isbn: String,
    genre: String,
    cover: String,
    pages: Number,
    
})

const Book = mongoose.model('Book', bookSchema)
module.exports = Book;



