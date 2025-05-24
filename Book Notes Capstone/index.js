// Import required modules for the Express application
import sanitizeHtml from 'sanitize-html';
import express from 'express';
import bodyParser from 'body-parser';
import { body, validationResult } from 'express-validator';
import path from 'path';
import pg from "pg";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { truncateText } from './src/js/util_server_side.js';
import { title } from 'process';
import { log } from 'console';

// Get current file and directory paths (needed for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Application configuration settings
const config = {
    port: process.env.PORT || 3000, // Use environment variable or default to 3000
    staticFiles: {
        directory: 'public', // Directory where static files are served from
        maxAge: '30d', // How long static files should be cached
        imageExtensions: ['.jpg', '.png', '.webp'] // Supported image file extensions
    }
};

// Initialize Express application
const app = express();

// Configure middleware for parsing URL-encoded request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Configure static file serving with caching rules
app.use(express.static(config.staticFiles.directory, {
    maxAge: config.staticFiles.maxAge,
    setHeaders: (res, filePath) => {
        // Special caching for image files
        if (config.staticFiles.imageExtensions.some(ext => filePath.endsWith(ext))) {
            res.set('Cache-Control', 'public, max-age=2592000'); // 30 days cache for images
        }
    },
    etag: true // Enable ETag caching
}));

// Before your routes
app.use((req, res, next) => {
    res.locals.title = 'BookNotes Capstone'; // default title
    next();
});

// Configure view engine settings
app.set('views', path.join(__dirname, 'views')); // Set directory for view templates
app.set('view engine', 'ejs'); // Use EJS as the template engine

// Configure PostgreSQL database connection pool
const db = new pg.Pool({
    user: "postgres",
    host: "localhost",
    database: "Books",
    password: "kumaPostgres!l",
    port: 5432,
});

// Establish database connection
await db.connect(); // Will start the database 

// Constants for star rating display
const FULL_STAR = '⭐';
const NO_STAR = '☆';

// Function to convert numeric rating to star emojis
function ratingsWithEmojis(rating) {
    rating = Math.round(rating); // Round to nearest whole number

    if (rating === 0) {
        return NO_STAR.repeat(5); // Return all empty stars if rating is 0
    }

    let emojiRating = '';
    for (let i = 0; i < 5; i++) {
        if (i < rating) {
            emojiRating += FULL_STAR;
        } else {
            emojiRating += NO_STAR;
        }
    }

    return emojiRating;
}

/**
 * Helper function to execute database queries with error handling
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise} Promise that resolves with query results
 */
async function executeQuery(query, params = []) {
    try {
        const result = await db.query(query, params);
        return result.rows;
    } catch (err) {
        console.error("Database query error:", err);
        throw err; // Propagate the error for higher-level handling
    }
}

// SQL queries for book operations
const INSERT_BOOK = "INSERT INTO books(title, isbn, cover_url, date_started, author) VALUES ($1, $2, $3, $4, $5) RETURNING *";
const INSERT_RATING = "INSERT INTO ratings(book_id, rating) VALUES ($1, $2) RETURNING *";
const INSERT_NOTE = "INSERT INTO notes(book_id, note) VALUES ($1, $2) RETURNING *";

// Helper function to insert data into database tables
async function insertRow(query, params, label) {
    const result = await executeQuery(query, params);
    console.log(`${label} added:`, result);
    return result;
}

// Cache variables for book data
let cachedBooks = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 10 * 1000; // Cache duration (10 seconds)

// SQL query to fetch books with their ratings and notes
const getBookNoteRatingQuery = `SELECT 
  books.book_id,
  books.title,
  books.cover_url,
  books.date_started,
  books.date_finished,
  books.author,
  COALESCE(ratings.rating, 0) AS rating,  -- Default rating to 0 if NULL
  COALESCE(notes.note, 'No note available') AS note,  -- Default note if NULL
  notes.created_at
FROM books
LEFT JOIN ratings ON books.book_id = ratings.book_id
LEFT JOIN notes ON books.book_id = notes.book_id`

// SQL query to fetch books with their ratings and notes
const getBookNoteRatingQuerywithBookID = `SELECT 
  books.book_id,
  books.title,
  books.cover_url,
  books.date_started,
  books.date_finished,
  books.author,
  COALESCE(ratings.rating, 0) AS rating,  -- Default rating to 0 if NULL
  COALESCE(notes.note, 'No note available') AS note,  -- Default note if NULL
  notes.created_at
FROM books
LEFT JOIN ratings ON books.book_id = ratings.book_id
LEFT JOIN notes ON books.book_id = notes.book_id
WHERE books.book_id = $1`;


// Function to get books with caching mechanism
async function getBooks() {
    const now = Date.now();

    // Return cached data if it's still fresh
    if (cachedBooks && (now - lastFetchTime) < CACHE_DURATION_MS) {
        console.log("Returning cached books");
        return cachedBooks;
    }

    // Otherwise fetch fresh data from database
    console.log("Fetching from database");
    let items = await executeQuery(getBookNoteRatingQuery);

    // Process book data - add truncated notes and star ratings
    const booksWithEmoji = items.map(item => ({
        ...item,
        note: truncateText(item.note, 150, true), // or item.note + " some addition"
        ratingEmoji: ratingsWithEmojis(item.rating)
    }));

    console.log(booksWithEmoji);

    // Update cache
    cachedBooks = booksWithEmoji;
    lastFetchTime = now;

    return booksWithEmoji;
}


// Controller object containing route handlers
const booksController = {
    // Handler for home page
    getHomePage: async (req, res) => {
        try {
            const databaseBooks = await getBooks();
            res.render("index", { books: databaseBooks, title: 'Home' });
        } catch (error) {
            console.error('Home page error:', error);
            res.status(500).render('500', { message: 'Internal Server Error', error: null });
        }
    },

    // Handler for new book form page
    getNewBookPage: (req, res) => {
        try {
            res.render("addNewBook", { loadDatepicker: true, title: 'Add Book' });
        } catch (error) {
            console.error("New book page error:", error);
            res.status(500).render('500', { message: 'Could not load new book page' });
        }
    },

    getAboutPage: async (req, res) => {
        try {
            res.render("about", { title: 'About' });
        } catch (error) {
            console.error("Viewing about page error:", error);
            res.status(500).render('500', { message: 'Could not load about page' });
        }
    },

    // Handler for viewing a single book
    viewBook: async (req, res) => {
        try {
            const result = await executeQuery(getBookNoteRatingQuerywithBookID, [req.params.id]);
            const book = result[0];
            if (!book) {
                return res.status(404).render('404', { message: 'Book not found' });
            }
            book.ratingEmoji = ratingsWithEmojis(book.rating);
            console.log("Book date finished:", book.date_finished);
            res.render("viewBookDetails", { book: book, title: book.title });

        } catch (error) {
            console.error("Viewing book page error:", error);
            // Ensure no duplicate response is sent
            if (!res.headersSent) {
                res.status(500).render('500', { message: 'Could not load book page' });
            }
        }
    },

    // Handler for updating a book
    updateBook: async (req, res) => {
        console.log("Updating book with ID:", req.params.id);
        const { title, author, date_started, date_finished, note, rating } = req.body;
        const bookId = req.params.id;


        try {
            const updatedDateFinished = date_finished ? date_finished : null;
            console.log("Updated date finished:", updatedDateFinished);
            // Update the book details in the database
            await executeQuery(
                `UPDATE books 
           SET title = $1, author = $2, date_started = $3, date_finished = $4 
           WHERE book_id = $5`,
                [title, author, date_started, updatedDateFinished, bookId]
            );

            // Update the rating in the database
            await executeQuery(
                `UPDATE ratings 
           SET rating = $1 
           WHERE book_id = $2`,
                [rating, bookId]
            );

            // Update the note in the database
            await executeQuery(
                `UPDATE notes 
           SET note = $1 
           WHERE book_id = $2`,
                [note, bookId]
            );

            // Redirect back to the book details page
            res.redirect(`/view-book/${bookId}`);
        } catch (error) {
            console.error('Error updating book:', error);
            res.status(500).render('500', { message: 'Could not update book' });
        }
    },

    // Handler for adding a new book (with validation middleware)
    addBook: [
        // Validation for ISBN field
        body("isbn")
            .trim()
            .isLength({ min: 10, max: 10 })
            .matches(/^\d{9}[\dXx]$/)
            .withMessage("Invalid ISBN format. Must be exactly 10 characters."),

        // Validation for title field
        body("title")
            .trim()
            .isLength({ min: 2, max: 150 })
            .escape()
            .withMessage("Title must be between 2 and 150 characters."),

        // Validation for date field
        body("date")
            .trim()
            .matches(/^\d{4}-\d{2}-\d{2}$/)
            .withMessage("Invalid date format. Use YYYY-MM-DD."),

        // Validation for note field (optional)
        body("note")
            .trim()
            .optional({ checkFalsy: true })
            .isLength({ max: 500 })
            .withMessage("Book notes must be at most 500 characters."),

        // Validation for cover URL (optional)
        body("coverUrl")
            .trim()
            .optional({ checkFalsy: true })
            .isURL({ protocols: ['http', 'https'], require_protocol: true })
            .withMessage("Must be a valid URL starting with http or https.")
            .matches(/\.(jpg|jpeg|png)$/i)
            .withMessage("URL must end in .jpg, .jpeg, or .png"),

        // Validation for rating (optional)
        body("book_rating")
            .trim()
            .optional({ checkFalsy: true })
            .isFloat({ min: 0, max: 5 })
            .withMessage("Rating must be an integer between 1 and 5."),

        // Validation for author field
        body("author")
            .trim()
            .isLength({ min: 2, max: 150 })
            .escape()
            .withMessage("Author must be between 2 and 150 characters."),

        // Main request handler for adding a book
        async (req, res) => {
            const OPEN_LIBRARY_DOMAIN = 'covers.openlibrary.org';
            const errors = validationResult(req);

            // Return validation errors if any exist
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Extract form data
            let { isbn, title, date, note, book_rating, coverUrl, author } = req.body;
            note = sanitizeHtml(note, {
                allowedTags: [],
                allowedAttributes: {}
            });
            console.log("New book data:", { isbn, title, date, note, book_rating, coverUrl, author });
            const starRating = await ratingsWithEmojis(book_rating);

            try {
                // Set default cover URL if none provided
                if (!coverUrl) {
                    coverUrl = `https://${OPEN_LIBRARY_DOMAIN}/b/isbn/${isbn}-L.jpg`;
                }

                // Insert book record
                const bookResult = await insertRow(INSERT_BOOK, [title, isbn, coverUrl, date, author], "Book");
                const newBookID = bookResult[0].book_id;

                // Insert rating record
                await insertRow(INSERT_RATING, [newBookID, parseFloat(book_rating)], "Rating");

                // Insert note record
                await insertRow(INSERT_NOTE, [newBookID, note], "Note");

                // Redirect to home page after successful addition
                res.redirect('/');
            } catch (error) {
                console.error("Book addition error:", error);
                // Check for duplicate ISBN error
                const isUniqueError = error.code === '23505';
                const message = isUniqueError
                    ? 'A book with this ISBN already exists in your collection.'
                    : 'Could not add book';

                // Render error page
                res.status(500).render('500', {
                    message,
                    error: process.env.NODE_ENV === 'development' ? error : null
                });
            }
        }
    ]
};

// ==============================================
// ROUTE DEFINITIONS
// ==============================================

// Home page route
app.get('/', booksController.getHomePage);

// New book form route
app.get('/new-book', booksController.getNewBookPage);

// View book details route
app.get('/view-book/:id', booksController.viewBook);

app.get('/about', booksController.getAboutPage);


// Add new book submission route
app.post('/addBook', booksController.addBook);

//route for updating book
app.post('/updateBook/:id', booksController.updateBook);


// Global error handler middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).render('500', {
        message: 'Something went wrong',
        error: process.env.NODE_ENV === 'development' ? err : null
    });
});

// 404 handler for unmatched routes
app.use((req, res) => {
    res.status(404).render('404', { message: 'Page not found', error: null });
});

// Custom EJS helper function for formatting dates
app.locals.formatDate = function (date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Start the Express server
const server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});

// Export app and server for testing or module use
export { app, server };