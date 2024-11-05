import express from "express"
const app = express()
const port = 3000

app.get("/", (req, res) => {
  res.send('<h1>Hello World. Home Page </h1>');
  console.log(req.rawHeaders);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.get("/about", (req, res) => {
  res.send("<h1>About Me </h1>")
})


app.get("/contact", (req, res) => {
  res.send("<h1>Contact Me </h1>")
})

