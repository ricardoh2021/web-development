import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Route for GET /
app.get("/", (req, res) => {
  res.locals.h1Content = "Enter Your Name Below👇";
  res.render("index.ejs");
});

// Route for POST /submit
app.post("/submit", (req, res) => {
  const { fName, lName } = req.body;
  const nameLength = (fName + lName).length;

  res.locals.h1Content = `There are ${nameLength} letters in your name.`;
  res.render("index.ejs");
});

// Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});