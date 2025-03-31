import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from 'axios';
import { body, validationResult } from 'express-validator';


const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get('/', async (req, res) => {
    try {
        // Send the respose
        res.render("index.ejs");
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/new-book', async (req, res) => {
    try {
        res.render("addNewBook.ejs", { loadDatepicker: true });
    } catch (error) {
        console.error("Could not add a new book");
    }
})

app.post('/addBook',
    [
        // Validate and sanitize ISBN
        body("isbn")
            .trim()
            .isLength({ min: 10, max: 10 })
            .matches(/^\d{9}[\dXx]$/)
            .withMessage("Invalid ISBN format. Must be exactly 10 characters."),

        // Validate and sanitize Title
        body("title")
            .trim()
            .isLength({ min: 2, max: 150 })
            .escape()
            .withMessage("Title must be between 2 and 150 characters."),

        // Validate and sanitize Date Read
        body("date")
            .trim()
            .matches(/^\d{4}-\d{2}-\d{2}$/)
            .withMessage("Invalid date format. Use YYYY-MM-DD."),

        // Sanitize Book Notes (Optional, strip HTML)
        body("note")
            .trim()
            .optional({ checkFalsy: true })
            .isLength({ max: 500 })
            .escape()
            .withMessage("Book notes must be at most 500 characters."),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { isbn, title, date, note, book_rating } = req.body;

        // Construct the Open Library cover URL
        const coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
        console.log(coverUrl);


        try {
            res.render("addNewBook.ejs", { loadDatepicker: true });
        } catch (error) {
            console.error("Could not fetch book cover:", error);
            res.status(500).send("Internal Server Error");
        }
    }
);


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
