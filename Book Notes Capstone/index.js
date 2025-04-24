import express from 'express';
import bodyParser from 'body-parser';
import { body, validationResult } from 'express-validator';
import path from 'path';
import pg from "pg";
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

const db = new pg.Pool({
    user: "postgres",
    host: "localhost",
    database: "Books",
    password: "kumaPostgres!l",
    port: 5432,
});


await db.connect(); //Will start the database 

const FULL_STAR = '⭐';
const NO_STAR = '☆';
function ratingsWithEmojis(rating) {
    rating = Math.round(rating);

    if (rating === 0) {
        return NO_STAR.repeat(5); // Return immediately, skip the loop
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
 * Executes a database query.
 * @param {string} query - The SQL query to execute.
 * @param {Array} params - The parameters for the query.
 * @returns {Promise} - Resolves with query results or rejects with an error.
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

const INSERT_BOOK = "INSERT INTO books(title, isbn, cover_url, date_started, author) VALUES ($1, $2, $3, $4, $5) RETURNING *";
const INSERT_RATING = "INSERT INTO ratings(book_id, rating) VALUES ($1, $2) RETURNING *";
const INSERT_NOTE = "INSERT INTO notes(book_id, note) VALUES ($1, $2) RETURNING *";

async function insertRow(query, params, label) {
    const result = await executeQuery(query, params);
    console.log(`${label} added:`, result);
    return result;
}

let cachedBooks = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 10 * 1000; // 10 seconds

const getBookNoteRatingQuery = `SELECT 
  books.book_id,
  books.title,
  books.cover_url,
  books.date_started,
  books.author,
  COALESCE(ratings.rating, 0) AS rating,  -- Default rating to 0 if NULL
  COALESCE(notes.note, 'No note available') AS note,  -- Default note if NULL
  notes.created_at
FROM books
LEFT JOIN ratings ON books.book_id = ratings.book_id
LEFT JOIN notes ON books.book_id = notes.book_id`

async function getBooks() {
    const now = Date.now();

    // If cache exists and it's recent, return it
    if (cachedBooks && (now - lastFetchTime) < CACHE_DURATION_MS) {
        console.log("Returning cached books");
        return cachedBooks;
    }

    // Otherwise, fetch from DB and cache it
    console.log("Fetching from database");
    let items = await executeQuery(getBookNoteRatingQuery);

    const booksWithEmoji = items.map(item => ({
        ...item,
        ratingEmoji: ratingsWithEmojis(item.rating)
    }));

    console.log(booksWithEmoji);

    cachedBooks = items;
    lastFetchTime = now;

    return booksWithEmoji;
}

// Controllers
const booksController = {
    getHomePage: async (req, res) => {
        try {
            const databaseBooks = await getBooks();
            res.render("index", { books: databaseBooks });
        } catch (error) {
            console.error('Home page error:', error);
            res.status(500).render('500', { message: 'Internal Server Error', error: null });
        }
    },

    getNewBookPage: (req, res) => {
        try {
            res.render("addNewBook", { loadDatepicker: true });
        } catch (error) {
            console.error("New book page error:", error);
            res.status(500).render('500', { message: 'Could not load new book page' });
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

        body("author")
            .trim()
            .isLength({ min: 2, max: 150 })
            .escape()
            .withMessage("Author must be between 2 and 150 characters."),

        // Handler
        async (req, res) => {
            const OPEN_LIBRARY_DOMAIN = 'covers.openlibrary.org';
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            let { isbn, title, date, note, book_rating, coverUrl, author } = req.body;
            console.log("New book data:", { isbn, title, date, note, book_rating, coverUrl, author });
            const starRating = await ratingsWithEmojis(book_rating);

            try {
                if (!coverUrl) {
                    coverUrl = `https://${OPEN_LIBRARY_DOMAIN}/b/isbn/${isbn}-L.jpg`;
                }

                // Insert book
                const bookResult = await insertRow(INSERT_BOOK, [title, isbn, coverUrl, date, author], "Book");
                const newBookID = bookResult[0].book_id;

                // Insert rating
                await insertRow(INSERT_RATING, [newBookID, parseFloat(book_rating)], "Rating");

                // Insert note
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

// Routes
app.get('/', booksController.getHomePage);
app.get('/new-book', booksController.getNewBookPage);
app.post('/addBook', booksController.addBook);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).render('500', {
        message: 'Something went wrong',
        error: process.env.NODE_ENV === 'development' ? err : null
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('404', { message: 'Page not found', error: null });
});

app.locals.formatDate = function (date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Start server
const server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});

export { app, server };