const express = require("express");
const { ObjectId } = require("mongodb");
const { connectToDb, getDb } = require("./db");

//middleware
const app = express();
app.use(express.json());

const port = process.env.port || 4000;

//db
let db;

connectToDb((err) => {
  if (!err) {
    app.listen(port, () => {
      console.log("app listening on port " + port);
    });
    db = getDb();
  }
});

//routes
app.get("/books", (req, res) => {
  let books = [];

  db.collection("books")
    .find()
    .sort({ author: 1 })
    .forEach((book) => books.push(book))
    .then(() => {
      res.status(200).json(books);
    })
    .catch(() => {
      res.status(500).json({ error: "could not fetch document" });
    });
});

//get a single book
app.get("/books/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    db.collection("books")
      .findOne({ _id: new ObjectId(req.params.id) })
      .then((doc) => {
        res.status(200).json(doc);
      })
      .catch((err) => {
        res.status(500).json({ error: "could not fetch the document" });
      });
  } else {
    res.status(500).json({ message: "Not valid" });
  }
});

//post a book
app.post("/books", (req, res) => {
  const book = req.body;

  db.collection("books")
    .insertOne(book)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(500).json({ message: "could not create a new document" });
    });
});

//delete book
app.delete("/books/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    db.collection("books")
      .deleteOne({ _id: new ObjectId(req.params.id) })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(400).json({ message: "could not delete object" });
      });
  } else {
    res.status(500).json({ message: "id not valid" });
  }
});

//patch book
app.patch("/books/:id", (req, res) => {
  const updates = req.body;

  if (ObjectId.isValid(req.params.id)) {
    db.collection("books")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(400).json({ message: "could not update object" });
      });
  } else {
    res.status(500).json({ message: "id not valid" });
  }
});
