import express from 'express';
import path from 'path';
import { dirname } from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;

const __dirname = dirname(fileURLToPath(import.meta.url));


// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Day-specific advice
const advice = {
    0: "Take it slow today. It's Sunday – time to recharge! It is the Lord's day!",
    1: "Motivation Monday! Start your week strong!",
    2: "It's Tuesday! Keep that momentum going!",
    3: "Happy Hump Day! You're halfway through the week!",
    4: "It's Thursday – time to finish strong!",
    5: "Friday is here! Wrap up and enjoy the weekend ahead!",
    6: "It's Saturday! Relax and do something fun!"
};

// Define the root route
app.get('/', (req, res) => {
    const today = new Date().getDay();
    const isWeekend = (today === 0 || today === 6);  // Sunday and Saturday are weekends
    const dayType = isWeekend ? "weekend" : "weekday";

    res.render('index', { advice: advice[today], dayType });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});