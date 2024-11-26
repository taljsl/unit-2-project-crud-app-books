const express = require("express");
const session = require("express-session");

const app = express();

const dotenv = require("dotenv");
dotenv.config();

const morgan = require("morgan");
const methodOverride = require("method-override");

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () =>
  console.log(`Connected to MongoDB  ${mongoose.connection.name}`)
);

const Book = require("./models/books.js");
const authController = require("./controllers/auth.js");

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    // the below was made w/ chatgpt it sets up a cookie that makes a guest info save for 24 hours
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);
// the below was also made w/ the help of chatgpt. This is middleware to set a session ID if one isn't present
app.use((req, res, next) => {
  if (!req.sessionID.user && !req.session.guestId) {
    req.session.guestId = req.sessionID;
  }
  next();
});

app.get("/", (req, res) => {
  res.render("home.ejs", { user: req.session.user });
});
// Instructions call for placing this .use below where we define homepage route
app.use("/auth", authController);

app.get('/books', async (req,res) => {
    let query={};
    // check for logged in user and pull those otherwise apply to guest session
    if (req.session.user) {
        query.account = req.session.user._id
    }else if (req.session.guestId) {
        query.sessionId= req.session.guestId
    }
    const books = await Book.find(query)
    res.render("books/books.ejs", { books });
})

// The below does not filter books see new get above made w/ gpt assitance 
// app.get("/books", async (req, res) => {
//   const allBooks = await Book.find();
//     res.render("books/books.ejs", { books: allBooks });
// });

app.get("/books/new", (req, res) => {
  res.render("books/new.ejs");
});

app.get("/books/:bookId", async (req, res) => {
  const foundBook = await Book.findById(req.params.bookId);
  res.render("books/show.ejs", { book: foundBook });
});
app.get("/books/:bookId/edit", async (req, res) => {
  const foundBook = await Book.findById(req.params.bookId);
  res.render("books/edit.ejs", { book: foundBook });
});

app.post("/books", async (req, res) => {
  const bookData = {
    title: req.body.title,
    author: req.body.author,
    publishedDate: req.body.publishedDate,
    description: req.body.description,
    isbn: req.body.isbn,
    genre: req.body.genre,
    cover: req.body.cover,
    pages: req.body.pages,
  };

  if (req.session.user) {
    bookData.account = req.session.user._id; 
  } else {
    bookData.sessionId = req.session.guestId;
  }
  await Book.create(bookData);
  res.redirect("/books");
});

app.delete("/books/:bookId", async (req, res) => {
  await Book.findByIdAndDelete(req.params.bookId);
  res.redirect("/books");
});

app.put("/books/:bookId", async (req, res) => {
  await Book.findByIdAndUpdate(req.params.bookId, req.body);
  res.redirect(`/books/${req.params.bookId}`);
});

app.listen(3001, () => {
  console.log("Listening on port 3001");
});
