import express from "express";
import bodyParser from "body-parser";
import pg from "pg";


const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "kumaPostgres!l",
  port: 5432,
});
db.connect();


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

let itemsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 60 * 1000; // Cache for 1 minute

async function getItems() {
  const currentTime = Date.now();
  if (itemsCache && cacheTimestamp && currentTime - cacheTimestamp < CACHE_DURATION) {
    console.log("Serving from cache");
    return itemsCache;
  }

  console.log("Fetching from database");
  const query = "SELECT * FROM items";
  itemsCache = await executeQuery(query);
  cacheTimestamp = currentTime;
  return itemsCache;
}


app.get("/", async (req, res) => {
  try {
    const items = await getItems(); // Use cached or DB result
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).send("An error occurred while fetching items.");
  }
});

app.post("/add", async (req, res) => {
  try {
    const newItem = req.body.newItem;
    const query = "INSERT INTO items(title) VALUES ($1) RETURNING *";
    const params = [newItem];
    const result = await executeQuery(query, params);
    console.log("Item added:", result);
    // Invalidate cache after adding an item
    itemsCache = null;
    cacheTimestamp = null;

    res.redirect("/");
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).send("An error occurred while adding item.");
  }

});

app.post("/edit", async (req, res) => {
  try {
    const newTitle = req.body.updatedItemTitle;
    const itemId = req.body.updatedItemId;
    const query = "UPDATE items SET title = $1 WHERE id = $2 RETURNING *";
    const params = [newTitle, itemId];
    const result = await executeQuery(query, params);
    console.log("Item added:", result);
    // Invalidate cache after adding an item
    itemsCache = null;
    cacheTimestamp = null;

    res.redirect("/");
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).send("An error occurred while updating item.");
  }

});

app.post("/delete", async (req, res) => {
  try {
    const itemId = req.body.deleteItemId
    const query = "DELETE FROM items WHERE id = $1 RETURNING *";
    const params = [itemId];
    const result = await executeQuery(query, params);
    console.log("Item deleted:", result);
    // Invalidate cache after adding an item
    itemsCache = null;
    cacheTimestamp = null;

    res.redirect("/");
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).send("An error occurred while deleting item.");
  }

});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
