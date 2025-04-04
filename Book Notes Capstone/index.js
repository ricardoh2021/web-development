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
        isFavorite: true,
        isbn10: '0735211299'
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
        isFavorite: false,
        isbn10: '0525559477'
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
        isFavorite: true,
        isbn10: '0062315005'
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
        isFavorite: true,
        isbn10: '0307887898'
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
        isFavorite: true,
        isbn10: '1471195201'
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
        isFavorite: true,
        isbn10: '0451524934'
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
        isFavorite: false,
        isbn10: '0140283293'
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
        isFavorite: true,
        isbn10: '0066620996'
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
        isFavorite: true,
        isbn10: '0140449264'
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
        isFavorite: true,
        isbn10: '081298160X'
    },
    {
        id: 11,
        coverUrl: 'https://covers.openlibrary.org/b/isbn/0316769533-L.jpg',
        title: 'The Catcher in the Rye',
        author: 'J.D. Salinger',
        rating: '⭐⭐⭐⭐☆',
        dateRead: 'Jun 20, 2021',
        notes: 'Classic coming-of-age story. Holden Caulfield’s voice is iconic.',
        genre: 'Fiction',
        pages: 277,
        isFavorite: false,
        isbn10: '0316769533'
    },
    {
        id: 12,
        coverUrl: 'https://covers.openlibrary.org/b/isbn/0143039453-L.jpg',
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        rating: '⭐⭐⭐⭐⭐',
        dateRead: 'May 5, 2023',
        notes: 'Witty and insightful social commentary. The romance between Elizabeth and Darcy is timeless.',
        genre: 'Classic',
        pages: 432,
        isFavorite: true,
        isbn10: '0143039453'
    },
    {
        id: 13,
        coverUrl: 'https://covers.openlibrary.org/b/isbn/0385474275-L.jpg',
        title: 'The Hitchhiker’s Guide to the Galaxy',
        author: 'Douglas Adams',
        rating: '⭐⭐⭐⭐☆',
        dateRead: 'Sep 28, 2021',
        notes: 'Hilarious and absurd sci-fi. The answer to the ultimate question of life, the universe, and everything is 42.',
        genre: 'Sci-Fi',
        pages: 224,
        isFavorite: true,
        isbn10: '0385474275'
    },
    {
        id: 14,
        coverUrl: 'https://covers.openlibrary.org/b/isbn/0786966151-L.jpg',
        title: 'Dune',
        author: 'Frank Herbert',
        rating: '⭐⭐⭐⭐⭐',
        dateRead: 'Jul 10, 2022',
        notes: 'Epic sci-fi with complex world-building. The political intrigue and ecological themes are fascinating.',
        genre: 'Sci-Fi',
        pages: 688,
        isFavorite: true,
        isbn10: '0786966151'
    },
    {
        id: 15,
        coverUrl: 'https://covers.openlibrary.org/b/isbn/0062402310-L.jpg',
        title: 'Educated',
        author: 'Tara Westover',
        rating: '⭐⭐⭐⭐⭐',
        dateRead: 'Apr 12, 2023',
        notes: 'Powerful memoir about overcoming a restrictive upbringing through education. Inspiring and thought-provoking.',
        genre: 'Memoir',
        pages: 334,
        isFavorite: true,
        isbn10: '0062402310'
    },
    {
        id: 16,
        coverUrl: 'https://covers.openlibrary.org/b/isbn/0385542203-L.jpg',
        title: 'The Girl with the Dragon Tattoo',
        author: 'Stieg Larsson',
        rating: '⭐⭐⭐⭐☆',
        dateRead: 'Nov 5, 2022',
        notes: 'Intriguing mystery with compelling characters. Lisbeth Salander is a memorable protagonist.',
        genre: 'Mystery',
        pages: 464,
        isFavorite: false,
        isbn10: '0385542203'
    },
    {
        id: 17,
        coverUrl: 'https://covers.openlibrary.org/b/isbn/0143130399-L.jpg',
        title: 'The Road',
        author: 'Cormac McCarthy',
        rating: '⭐⭐⭐⭐☆',
        dateRead: 'Aug 18, 2023',
        notes: 'Post-apocalyptic novel with haunting prose. The relationship between the father and son is heart-wrenching.',
        genre: 'Dystopian',
        pages: 241,
        isFavorite: false,
        isbn10: '0143130399'
    },
    {
        id: 18,
        coverUrl: 'https://covers.openlibrary.org/b/isbn/0062334818-L.jpg',
        title: 'Thinking, Fast and Slow',
        author: 'Daniel Kahneman',
        rating: '⭐⭐⭐⭐☆',
        dateRead: 'Jan 22, 2023',
        notes: 'Fascinating insights into human decision-making. The concepts of System 1 and System 2 are eye-opening.',
        genre: 'Psychology',
        pages: 499,
        isFavorite: true,
        isbn10: '0062334818'
    },
    {
        id: 19,
        coverUrl: 'https://covers.openlibrary.org/b/isbn/0062458713-L.jpg',
        title: 'Where the Crawdads Sing',
        author: 'Delia Owens',
        rating: '⭐⭐⭐⭐☆',
        dateRead: 'Jun 1, 2022',
        notes: 'Beautifully written with a compelling mystery. The descriptions of the marsh are vivid and immersive.',
        genre: 'Fiction',
        pages: 384,
        isFavorite: true,
        isbn10: '0062458713'
    },
    {
        id: 20,
        coverUrl: 'https://covers.openlibrary.org/b/isbn/0399563822-L.jpg',
        title: 'The Silent Patient',
        author: 'Alex Michaelides',
        rating: '⭐⭐⭐⭐☆',
        dateRead: 'Oct 25, 2023',
        notes: 'Gripping psychological thriller with a surprising twist. Couldn’t put it down.',
        genre: 'Thriller',
        pages: 323,
        isFavorite: true,
        isbn10: '0399563822'
    },
    {
        id: 21,
        coverUrl: 'https://covers.openlibrary.org/b/isbn/0345816021-L.jpg',
        title: 'Can\'t Hurt Me: Master Your Mind and Defy the Odds',
        author: 'David Goggins',
        rating: '⭐⭐⭐⭐⭐',
        dateRead: 'Dec 10, 2024',
        notes: 'Incredible story of overcoming adversity through mental toughness. Inspired me to push my limits.',
        genre: 'Autobiography',
        pages: 370,
        isFavorite: true,
        isbn10: '0345816021'
    },
    {
        id: 22,
        coverUrl: 'https://covers.openlibrary.org/b/isbn/034581603X-L.jpg',
        title: 'Never Finished: Unshackle Your Mind and Win the War Within',
        author: 'David Goggins',
        rating: '⭐⭐⭐⭐☆',
        dateRead: 'Feb 5, 2025',
        notes: 'Further insights into mindset and pushing beyond perceived limitations. A great follow-up.',
        genre: 'Self-help',
        pages: 336,
        isFavorite: true,
        isbn10: '034581603X'
    },
    {
        id: 23,
        coverUrl: 'https://covers.openlibrary.org/b/isbn/0345816048-L.jpg',
        title: '12 Rules for Life: An Antidote to Chaos',
        author: 'Jordan B. Peterson',
        rating: '⭐⭐⭐⭐☆',
        dateRead: 'Jan 18, 2025',
        notes: 'Thought-provoking principles for life, blending psychology, philosophy, and mythology.',
        genre: 'Self-help',
        pages: 448,
        isFavorite: false,
        isbn10: '0345816048'
    },
    {
        id: 24,
        coverUrl: 'https://covers.openlibrary.org/b/isbn/0345816056-L.jpg',
        title: 'Beyond Order: 12 More Rules for Life',
        author: 'Jordan B. Peterson',
        rating: '⭐⭐⭐⭐☆',
        dateRead: 'Mar 20, 2025',
        notes: 'Expands on the initial rules, focusing on navigating the complexities of life and society.',
        genre: 'Self-help',
        pages: 416,
        isFavorite: false,
        isbn10: '0345816056'
    },
    {
        id: 25,
        coverUrl: 'https://covers.openlibrary.org/b/isbn/1941663308-L.jpg',
        title: 'Why We\'re Catholic: Our Reasons for Faith, Hope, and Love',
        author: 'Trent Horn',
        rating: '⭐⭐⭐⭐⭐',
        dateRead: 'Nov 10, 2024',
        notes: 'Clear and compelling arguments for the Catholic faith. Excellent for understanding Catholic beliefs.',
        genre: 'Religion',
        pages: 288,
        isFavorite: true,
        isbn10: '1941663308'
    },
    {
        id: 26,
        coverUrl: 'https://covers.openlibrary.org/b/isbn/1941663588-L.jpg',
        title: 'The Case for Catholicism: Answers to Classic and Contemporary Protestant Objections',
        author: 'Trent Horn',
        rating: '⭐⭐⭐⭐⭐',
        dateRead: 'Dec 15, 2024',
        notes: 'Addresses common Protestant objections to Catholic teachings with clarity and reason.',
        genre: 'Religion',
        pages: 384,
        isFavorite: true,
        isbn10: '1941663588'
    },
    {
        id: 27,
        coverUrl: 'https://covers.openlibrary.org/b/isbn/1941663294-L.jpg',
        title: 'Persuasive Pro-life: How to Talk About Our Culture\'s Toughest Issue',
        author: 'Trent Horn',
        rating: '⭐⭐⭐⭐⭐',
        dateRead: 'Jan 10, 2025',
        notes: 'Provides effective strategies for engaging in respectful and persuasive pro-life conversations.',
        genre: 'Religion',
        pages: 256,
        isFavorite: true,
        isbn10: '1941663294'
    },
    {
        id: 28,
        coverUrl: 'https://covers.openlibrary.org/b/isbn/1941663944-L.jpg',
        title: 'Made This Way: How to Prepare Kids to Face Today\'s Tough Moral Questions',
        author: 'Trent Horn',
        rating: '⭐⭐⭐⭐⭐',
        dateRead: 'Feb 20, 2025',
        notes: 'A guide for parents on how to discuss challenging moral issues with their children from a Catholic perspective.',
        genre: 'Religion',
        pages: 288,
        isFavorite: true,
        isbn10: '1941663944'
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
