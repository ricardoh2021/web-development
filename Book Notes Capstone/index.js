import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from 'axios';


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
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
