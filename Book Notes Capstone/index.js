import express from 'express';
import bodyParser from 'body-parser';
import { body, validationResult } from 'express-validator';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const config = {
    port: process.env.PORT || 3000,
    staticFiles: {
        directory: 'public',
        maxAge: '30d',
        imageExtensions: ['.jpg', '.png', '.webp']
    }
};

// Initialize Express app
const app = express();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(config.staticFiles.directory, {
    maxAge: config.staticFiles.maxAge,
    setHeaders: (res, filePath) => {
        if (config.staticFiles.imageExtensions.some(ext => filePath.endsWith(ext))) {
            res.set('Cache-Control', 'public, max-age=2592000'); // 30 days in seconds
        }
    },
    etag: true
}));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Data layer (would normally be in a separate file/database)
import { sampleBooks } from './__data/sampleBooks.js';
// Controllers
const booksController = {
    getHomePage: async (req, res) => {
        try {
            res.render("index", { books: sampleBooks });
        } catch (error) {
            console.error('Home page error:', error);
            res.status(500).render('error', { message: 'Internal Server Error', error: null });
        }
    },

    getNewBookPage: (req, res) => {
        try {
            res.render("addNewBook", { loadDatepicker: true });
        } catch (error) {
            console.error("New book page error:", error);
            res.status(500).render('error', { message: 'Could not load new book page' });
        }
    },

    addBook: [
        // Validation middleware
        body("isbn")
            .trim()
            .isLength({ min: 10, max: 10 })
            .matches(/^\d{9}[\dXx]$/)
            .withMessage("Invalid ISBN format. Must be exactly 10 characters."),

        body("title")
            .trim()
            .isLength({ min: 2, max: 150 })
            .escape()
            .withMessage("Title must be between 2 and 150 characters."),

        body("date")
            .trim()
            .matches(/^\d{4}-\d{2}-\d{2}$/)
            .withMessage("Invalid date format. Use YYYY-MM-DD."),

        body("note")
            .trim()
            .optional({ checkFalsy: true })
            .isLength({ max: 500 })
            .escape()
            .withMessage("Book notes must be at most 500 characters."),

        body("coverUrl")
            .trim()
            .optional({ checkFalsy: true })
            .isURL({ protocols: ['http', 'https'], require_protocol: true })
            .withMessage("Must be a valid URL starting with http or https.")
            .matches(/\.(jpg|jpeg|png)$/i)
            .withMessage("URL must end in .jpg, .jpeg, or .png"),

        body("book_rating")
            .trim()
            .optional({ checkFalsy: true })
            .isFloat({ min: 0, max: 5 })
            .withMessage("Rating must be an integer between 1 and 5."),

        // Handler
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { isbn, title, date, note, book_rating, coverUrl } = req.body;
            console.log("New book data:", { isbn, title, date, note, book_rating, coverUrl });

            try {
                // In a real app, you would save to database here
                if (coverUrl == '') {
                    console.log("Hello, no need for a book url cover")
                }
                else {
                    console.log("coverUrl was entered by user");


                }
                // Redirect to home page or show success message
                res.redirect('/');
            } catch (error) {
                console.error("Book addition error:", error);
                res.status(500).render('error', {
                    message: 'Could not add book',
                    error: process.env.NODE_ENV === 'development' ? error : null
                });
            }
        }
    ]
};

// Routes
app.get('/', booksController.getHomePage);
app.get('/new-book', booksController.getNewBookPage);
app.post('/addBook', booksController.addBook);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).render('error', {
        message: 'Something went wrong',
        error: process.env.NODE_ENV === 'development' ? err : null
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', { message: 'Page not found', error: null });
});

// Start server
const server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});

export { app, server };