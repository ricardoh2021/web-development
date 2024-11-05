import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

function checkPassword(req, res) {
    const password = req.body["password"];
    console.log(password);
    if (password === 'ILoveProgramming') {
        res.sendFile(__dirname + "/public/secret.html");
    } else {
        res.redirect('/');
    }
    // Remove `next()` here to prevent further handling of the request
}

// Attach `checkPassword` only to the `/check` POST route
app.post("/check", checkPassword);

app.get("/", (req, res) => {
    console.log("Hello World");
    res.sendFile(__dirname + "/public/index.html");
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});