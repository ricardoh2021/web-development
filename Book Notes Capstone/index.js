// Import required modules
import express from 'express';
import bodyParser from 'body-parser';
import { body, validationResult } from 'express-validator';
import path from 'path';
import pg from "pg";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { truncateText } from './src/js/util_server_side.js';

// Get current directory path (ES modules compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ==============================================
// CONFIGURATION SECTION
// ==============================================
const config = {
    port: process.env.PORT || 3000, // Use environment port or default to 3000
    staticFiles: {
        directory: 'public', // Directory for static files
        maxAge: '30d', // Cache duration for static files
        imageExtensions: ['.jpg', '.png', '.webp'] // Supported image extensions
    }
};

// Initialize Express application
const app = express();

// ==============================================
// MIDDLEWARE SETUP
// ==============================================
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.static(config.staticFiles.directory, {
    maxAge: config.staticFiles.maxAge,
    setHeaders: (res, filePath) => {
        // Set longer cache for images
        if (config.staticFiles.imageExtensions.some(ext => filePath.endsWith(ext))) {
            res.set('Cache-Control', 'public, max-age=2592000'); // 30 days in seconds
        }
    },
    etag: true // Enable ETag caching
}));

// ==============================================
// VIEW ENGINE CONFIGURATION
// ==============================================
app.set('views', path.join(__dirname, 'views')); // Set views directory
app.set('view engine', 'ejs'); // Use EJS as template engine

// ==============================================
// DATABASE CONFIGURATION
// ==============================================
const db = new pg.Pool({
    user: "postgres",
    host: "localhost",
    database: "Books",
    password: "kumaPostgres!l",
    port: 5432,
});

await db.connect(); // Initialize database connection

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

/**
 * Converts numeric rating to star emoji representation
 * @param {number} rating - The rating value (0-5)
 * @returns {string} - String of star emojis
 */
function ratingsWithEmojis(rating) {
    rating = Math.round(rating); // Round to nearest integer

    if (rating === 0) {
        return NO_STAR.repeat(5); // Return empty stars if rating is 0
    }

    let emojiRating = '';
    for (let i = 0; i < 5; i++) {
        emojiRating += (i < rating) ? FULL_STAR : NO_STAR;
    }

    return emojiRating;
}

/**
 * Executes a database query with error handling
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise} - Resolves with query results or rejects with error
 */
async function executeQuery(query, params = []) {
    try {
        const result = await db.query(query, params);
        return result.rows;
    } catch (err) {
        console.error("Database query error:", err);
        throw err; // Propagate error for handling upstream
    }
}

// SQL query constants for book operations
const INSERT_BOOK = "INSERT INTO books(title, isbn, cover_url, date_started, author) VALUES ($1, $2, $3, $4, $5) RETURNING *";
const INSERT_RATING = "INSERT INTO ratings(book_id, rating) VALUES ($1, $2) RETURNING *";
const INSERT_NOTE = "INSERT INTO notes(book_id, note) VALUES ($1, $2) RETURNING *";

/**
 * Helper function to insert a row into the database
 * @param {string} query - SQL insert query
 * @param {Array} params - Query parameters
 * @param {string} label - Description for logging
 * @returns {Promise} - Resolves with inserted row
 */
async function insertRow(query, params, label) {
    const result = await executeQuery(query, params);
    console.log(`${label} added:`, result);
    return result;
}

// Cache variables for book data
let cachedBooks = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 10 * 1000; // Cache duration (10 seconds)

// Main query to fetch books with ratings and notes
const getBookNoteRatingQuery = `SELECT 
  books.book_id,
  books.title,
  books.cover_url,
  books.date_started,
  books.author,
  COALESCE(ratings.rating, 0) AS rating,  -- Default to 0 if NULL
  COALESCE(notes.note, 'No note available') AS note,  -- Default message if NULL
  notes.created_at
FROM books
LEFT JOIN ratings ON books.book_id = ratings.book_id
LEFT JOIN notes ON books.book_id = notes.book_id`;

/**
 * Fetches books from database with caching mechanism
 * @returns {Promise} - Resolves with array of book objects
 */
async function getBooks() {
    const now = Date.now();

    // Return cached data if it exists and is fresh
    if (cachedBooks && (now - lastFetchTime) < CACHE_DURATION_MS) {
        console.log("Returning cached books");
        return cachedBooks;
    }

    // Fetch fresh data from database
    console.log("Fetching from database");
    let items = await executeQuery(getBookNoteRatingQuery);

    // Process book data
    const booksWithEmoji = items.map(item => ({
        ...item,
        note: truncateText(item.note, 150, true), // Truncate long notes
        ratingEmoji: ratingsWithEmojis(item.rating) // Add star rating emojis
    }));

    // Update cache
    cachedBooks = items;
    lastFetchTime = now;

    return booksWithEmoji;
}

// ==============================================
// CONTROLLERS
// ==============================================
const booksController = {
    /**
     * Handles home page request
     */
    getHomePage: async (req, res) => {
        try {
            const databaseBooks = await getBooks();
            res.render("index", { books: databaseBooks });
        } catch (error) {
            console.error('Home page error:', error);
            res.status(500).render('500', { message: 'Internal Server Error', error: null });
        }
    },

    /**
     * Renders new book form page
     */
    getNewBookPage: (req, res) => {
        try {
            res.render("addNewBook", { loadDatepicker: true });
        } catch (error) {
            console.error("New book page error:", error);
            res.status(500).render('500', { message: 'Could not load new book page' });
        }
    },

    /**
     * Handles viewing a single book's details
     */
    viewBook: async (req, res) => {
        try {
            console.log(req.params)
            const { id } = req.params;
            res.render("viewBookDetails");
        } catch (error) {
            console.error("Viewing book page error:", error);
            res.status(500).render('500', { message: 'Could not load book page' });
        }
    },

    /**
     * Handles adding a new book with validation
     */
    addBook: [
        // Validation middleware chain
        body("isbn")
            .trim()
            .isLength({ min: 10, max: 10 })
            .matches(/^\d{9}[\dXx]$/)
            .withMessage("Invalid ISBN format. Must be exactly 10 characters."),

        // ... other validation rules ...

        // Main request handler
        async (req, res) => {
            const OPEN_LIBRARY_DOMAIN = 'covers.openlibrary.org';
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            let { isbn, title, date, note, book_rating, coverUrl, author } = req.body;
            console.log("New book data:", { isbn, title, date, note, book_rating, coverUrl, author });

            try {
                // Set default cover URL if none provided
                if (!coverUrl) {
                    coverUrl = `https://${OPEN_LIBRARY_DOMAIN}/b/isbn/${isbn}-L.jpg`;
                }

                // Insert book record
                const bookResult = await insertRow(INSERT_BOOK, [title, isbn, coverUrl, date, author], "Book");
                const newBookID = bookResult[0].book_id;

                // Insert associated rating
                await insertRow(INSERT_RATING, [newBookID, parseFloat(book_rating)], "Rating");

                // Insert associated note
                await insertRow(INSERT_NOTE, [newBookID, note], "Note");

                res.redirect('/');
            } catch (error) {
                console.error("Book addition error:", error);
                const isUniqueError = error.code === '23505';
                const message = isUniqueError
                    ? 'A book with this ISBN already exists in your collection.'
                    : 'Could not add book';

                res.status(500).render('500', {
                    message,
                    error: process.env.NODE_ENV === 'development' ? error : null
                });
            }
        }
    ]
};

// ==============================================
// ROUTES
// ==============================================
app.get('/', booksController.getHomePage);
app.get('/new-book', booksController.getNewBookPage);
app.get('/view-book/:id', booksController.viewBook);
app.post('/addBook', booksController.addBook);

// ==============================================
// ERROR HANDLING MIDDLEWARE
// ==============================================
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

// Custom EJS helper for date formatting
app.locals.formatDate = function (date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// ==============================================
// SERVER INITIALIZATION
// ==============================================
const server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});

export { app, server };