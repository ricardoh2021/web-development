import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from 'axios';
import { body, validationResult } from 'express-validator';


const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
// Static file caching middleware in Express
app.use(express.static('public', {
    maxAge: '30d', // Cache images for 30 days
    setHeaders: function (res, path) {
        if (path.endsWith('.jpg') || path.endsWith('.png') || path.endsWith('.webp')) {
            res.set('Cache-Control', 'public, max-age=2592000'); // 30 days in seconds
        }
    },
    etag: true
}));

// In your route handler (e.g., app.js or booksController.js)
const sampleBooks = [
    {
        id: 1,
        coverUrl: 'https://covers.openlibrary.org/b/isbn/0735211299-L.jpg',
        title: 'Atomic Habits',
        author: 'James Clear',
        rating: '⭐⭐⭐⭐⭐',
        dateRead: 'Mar 15, 2023',
        notes: 'Fantastic book about building good habits and breaking bad ones. The 1% rule concept was particularly impactful.',
        genre: 'Self-help',
        pages: 320,
        isFavorite: true
    },
    {
        id: 2,
        coverUrl: 'https://covers.openlibrary.org/b/isbn/0525559477-L.jpg',
        title: 'The Midnight Library',
        author: 'Matt Haig',
        rating: '⭐⭐⭐⭐☆',
        dateRead: 'Jan 5, 2023',
        notes: 'A beautiful exploration of regret and alternate lives. Made me appreciate my current path more deeply.',
        genre: 'Fiction',
        pages: 304,
        isFavorite: false
    },
    {
        id: 3,
        coverUrl: 'https://covers.openlibrary.org/b/isbn/0062315005-L.jpg',
        title: 'The Alchemist',
        author: 'Paulo Coelho',
        rating: '⭐⭐⭐☆☆',
        dateRead: 'Nov 20, 2022',
        notes: 'Poetic fable about following your dreams. Somewhat repetitive but has memorable quotes.',
        genre: 'Fantasy',
        pages: 208,
        isFavorite: true
    },
    {
        id: 4,
        coverUrl: 'https://covers.openlibrary.org/b/isbn/0307887898-L.jpg',
        title: 'The Power of Habit',
        author: 'Charles Duhigg',
        rating: '⭐⭐⭐⭐⭐',
        dateRead: 'Feb 10, 2023',
        notes: 'Great insights into how habits work and how to change them. The Keystone Habit concept was very interesting.',
        genre: 'Self-help',
        pages: 400,
        isFavorite: true
    },
    {
        id: 5,
        coverUrl: 'https://covers.openlibrary.org/b/isbn/1471195201-L.jpg',
        title: 'The Seven Habits of Highly Effective People',
        author: 'Stephen R. Covey',
        rating: '⭐⭐⭐⭐⭐',
        dateRead: 'Apr 22, 2022',
        notes: 'Timeless principles for personal and professional effectiveness. Found the concepts of "Circle of Influence" and "Sharpen the Saw" very helpful.',
        genre: 'Self-help',
        pages: 381,
        isFavorite: true
    },
    {
        id: 6,
        coverUrl: 'https://covers.openlibrary.org/b/isbn/0451524934-L.jpg',
        title: '1984',
        author: 'George Orwell',
        rating: '⭐⭐⭐⭐⭐',
        dateRead: 'Jul 15, 2021',
        notes: 'A chilling dystopian novel that feels more relevant than ever. The concept of Big Brother is haunting.',
        genre: 'Dystopian',
        pages: 328,
        isFavorite: true
    },
    {
        id: 7,
        coverUrl: 'https://covers.openlibrary.org/b/isbn/0140283293-L.jpg',
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        rating: '⭐⭐⭐⭐☆',
        dateRead: 'Dec 1, 2023',
        notes: 'Eye-opening perspective on human history. Sometimes oversimplifies, but the insights are fascinating.',
        genre: 'History',
        pages: 464,
        isFavorite: false
    },
    {
        id: 8,
        coverUrl: 'https://covers.openlibrary.org/b/isbn/0066620996-L.jpg',
        title: 'Good to Great',
        author: 'Jim Collins',
        rating: '⭐⭐⭐⭐☆',
        dateRead: 'Sep 10, 2022',
        notes: 'Loved the research-driven approach. The "Hedgehog Concept" and "Level 5 Leadership" stood out.',
        genre: 'Business',
        pages: 320,
        isFavorite: true
    },
    {
        id: 9,
        coverUrl: 'https://covers.openlibrary.org/b/isbn/0140449264-L.jpg',
        title: 'Meditations',
        author: 'Marcus Aurelius',
        rating: '⭐⭐⭐⭐⭐',
        dateRead: 'Aug 3, 2023',
        notes: 'Timeless wisdom from a Stoic philosopher. A must-read for self-discipline and perspective on life.',
        genre: 'Philosophy',
        pages: 304,
        isFavorite: true
    },
    {
        id: 10,
        coverUrl: 'https://covers.openlibrary.org/b/isbn/081298160X-L.jpg',
        title: 'Man’s Search for Meaning',
        author: 'Viktor E. Frankl',
        rating: '⭐⭐⭐⭐⭐',
        dateRead: 'Oct 18, 2022',
        notes: 'A powerful reflection on suffering and resilience. The idea of finding meaning even in hardship is life-changing.',
        genre: 'Psychology',
        pages: 192,
        isFavorite: true
    }
];

app.get('/', async (req, res) => {
    try {
        // Send the respose
        res.render("index.ejs", { books: sampleBooks });
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
