import express from 'express';

const router = express.Router();

// In-memory array to store posts temporarily
// let posts = [];

//Sample data

let posts = [
    {
        id: 1,
        date: new Date('2024-01-15'),
        title: "The Journey to Learning JavaScript",
        content: "JavaScript has become an essential part of modern web development. In this post, I'll share my journey from beginner to proficient developer, highlighting key learning resources, challenges faced, and how building small projects helped me grow.",
        image: "/images/javascript.png",
        category: "Web Development"
    },
    {
        id: 2,
        date: new Date('2024-02-20'),
        title: "5 Tips for Better Code Readability",
        content: "Writing code that is easy to read and maintain is a skill that sets great developers apart. In this article, I share five practical tips that can help you improve the readability of your code and collaborate more effectively with other developers.",
        image: "/images/readability.jpg",
        category: "Programming Tips"
    },
    {
        id: 3,
        date: new Date('2024-03-10'),
        title: "Exploring the Parallax Effect in Web Design",
        content: "The parallax effect is a popular trend in modern web design that creates an engaging user experience by making background images move more slowly than foreground content. Learn how to implement this effect and best practices for enhancing your web projects.",
        image: "/images/design.jpg",
        category: "Web Design"
    },
    {
        id: 4,
        date: new Date('2024-04-05'),
        title: "Building a Personal Blog with Node.js and EJS",
        content: "Creating your personal blog is easier than ever with Node.js and EJS templates. I'll guide you step-by-step through setting up your blog, customizing it, and deploying it so that you can share your thoughts with the world.",
        image: "/images/nodejs.png",
        category: "Full Stack Development"
    },
    {
        id: 5,
        date: new Date('2024-05-12'),
        title: "Top 10 Resources for Learning Full-Stack Development",
        content: "Becoming a full-stack developer requires mastering both front-end and back-end technologies. Here are my top 10 resources, including courses, books, and websites, that have helped me along the way.",
        image: "fullstack-resources.jpg",
        category: "Learning Resources"
    }
];
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