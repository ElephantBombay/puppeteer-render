const express = require("express");
const app = express();
const { scrapeLogic } = require("./scrapeLogic"); // To destructure {}, it means we're referencing the exact name of the functions in the module from which we're importing it

const PORT = process.env.PORT || 4000; /// We use env variables for the port because we wont know what the port is when deployed

app.get("/", (req, res) => {
  //   console.log("test");
  res.send("Render Puppeteer is up an running");
});

app.get("/scrape", (req, res) => {
  scrapeLogic(res);
});

app.listen(PORT, () => {
  console.log("Listening on port 4000. See localhost:4000");
});
