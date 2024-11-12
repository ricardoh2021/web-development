import express from 'express';

const router = express.Router();

// In-memory array to store posts temporarily
let posts = [];

// Route to display all posts
router.get('/', (req, res) => {
    res.render('index', { posts });
});

// Route to render the create post form
router.get('/create', (req, res) => {
    res.render('create');
});

// Route to handle post creation
router.post('/create', (req, res) => {
    const { title, content } = req.body;
    posts.push({ id: Date.now(), title, content });
    res.redirect('/');
});

// Export the router
export default router;