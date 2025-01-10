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

await db.connect();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Helper function to get visited countries
const getVisitedCountries = async () => {
  try {
    const result = await db.query('SELECT country_code FROM visited_countries');
    return result.rows.map(item => item.country_code);
  } catch (err) {
    console.error("Error fetching visited countries:", err);
    throw err;
  }
};

// GET route - render homepage with countries
app.get("/", async (req, res) => {
  try {
    const countryCodes = await getVisitedCountries();
    res.render("index.ejs", { countries: countryCodes, total: countryCodes.length });
  } catch (err) {
    res.status(500).send("Error loading the page.");
  }
});

// POST route - add a country if it exists in the database
app.post("/add", async (req, res) => {
  const userCountryInput = req.body.country.trim();

  try {
    // Use parameterized queries to prevent SQL injection
    const countryQuery = await db.query(
      'SELECT * FROM countries WHERE LOWER(country_name) = LOWER($1)',
      [userCountryInput]
    );

    if (countryQuery.rowCount > 0) {
      const countryCode = countryQuery.rows[0].country_code;
      console.log(`Country found: ${countryCode}`);

      await db.query(
        'INSERT INTO visited_countries (country_code) VALUES ($1)',
        [countryCode]
      );

      res.redirect("/");
    } else {
      console.log('Country not found.');
      res.redirect("/");
    }
  } catch (err) {
    console.error("Error adding country:", err);
    res.status(500).send("Error processing your request.");
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});