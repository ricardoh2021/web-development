import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

// Initialize the database connection
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "World",
  password: "kumaPostgres!l",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function getUsers() {
  const result = await db.query("SELECT * FROM users");
  return result.rows;
}

let current_user_id = 1;

async function checkVisited(user_id = 1) {
  const result = await db.query(
    "SELECT * FROM users INNER JOIN visited_countries ON users.id = visited_countries.user_id WHERE users.id = $1",
    [user_id]
  );
  return result.rows.map(country => country.country_code);
}

app.get("/", async (req, res) => {
  try {
    const countries = await checkVisited();
    console.log(countries)
    const users = await getUsers();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      users: users,
      color: "teal",
    });
  } catch (err) {
    console.log(err);
    res.render("index.ejs", {
      countries: [],
      total: 0,
      users: [],
      color: "teal",
      error: "Failed to load data, please try again later."
    });
  }
});

app.post("/add", async (req, res) => {
  const input = req.body["country"];
  const users = await getUsers();
  const foundUser = users.find(user => user.id === current_user_id);

  // Fetch the current list of countries before trying to add a new one
  const countries = await checkVisited(current_user_id);

  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    const data = result.rows[0];
    const countryCode = data ? data.country_code : null;

    if (!countryCode) {
      // If country not found, just render the page with the current list of countries
      return res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        users: await getUsers(),
        color: foundUser ? foundUser.color : 'teal', // Keep the same color
        error: "Country not found."
      });
    }

    // Insert the country into visited countries
    await db.query(
      "INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2)",
      [countryCode, current_user_id]
    );

    // Fetch the updated list of countries after insertion
    const updatedCountries = await checkVisited(current_user_id);

    res.render("index.ejs", {
      countries: updatedCountries,
      total: updatedCountries.length,
      users: users,
      color: foundUser ? foundUser.color : 'teal', // Keep the same color
    });
  } catch (err) {
    console.log(err);
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      users: await getUsers(),
      color: foundUser ? foundUser.color : 'teal', // Keep the same color
      error: "Failed to add country, please try again."
    });
  }
});

app.post("/user", async (req, res) => {
  const userID = Number(req.body.user);
  try {
    const users = await getUsers();
    const foundUser = users.find(user => user.id === userID);

    if (foundUser) {
      current_user_id = userID;
      const countries = await checkVisited(userID);
      console.log(countries)
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        users: users,
        color: foundUser.color,
      });
    } else if (req.body.add === 'new') {
      res.render("new.ejs");
    } else {
      res.render("index.ejs", {
        countries: await checkVisited(current_user_id),
        total: 0,
        users: users,
        color: "teal",
        error: "User not found."
      });
    }
  } catch (err) {
    console.log(err);
    res.render("index.ejs", {
      countries: await checkVisited(current_user_id),
      total: 0,
      users: await getUsers(),
      color: "teal",
      error: "Failed to load user data, please try again."
    });
  }
});

app.post("/new", async (req, res) => {
  const { name, color } = req.body;
  if (!name) {
    return res.render("new.ejs", { error: "Name is required." });
  }

  try {
    const result = await db.query(
      "INSERT INTO users (name, color) VALUES ($1, $2) RETURNING id, color",
      [name, color]
    );

    const newUserColor = result.rows[0].color;
    const newUserId = result.rows[0].id;
    const countries = await checkVisited(newUserId);
    current_user_id = newUserId;

    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      users: await getUsers(),
      color: newUserColor,
    });
  } catch (err) {
    console.log(err);
    res.render("new.ejs", { error: "Failed to create new user, please try again." });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});