const express = require("express");
const app = express();
const { scrapeLogic } = require("./scrapeLogic"); // To destructure {}, it means we're referencing the exact name of the function in the module from which we're importing it

// app.use(express.urlencoded({ extended: true })); //Middleware to decrypt the POST body
const PORT = process.env.PORT || 4000; /// We use env variables for the port because we wont know what the port is when deployed

app.get("/", (req, res) => {
  res.send("ScraperBot v1.0 is up and running.");
});

app.post("/trustpilot", (req, res) => {
  try {
    const target = new URL(req.query.target);
    res.json({ message: "sent" });
    scrapeLogic(target.host);
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

app.listen(PORT, () => {
  console.log("Listening on port 4000. See http://localhost:4000");
});

////Setup
// Deployment based on https://www.youtube.com/watch?v=6cm6G78ZDmM&list=WL&index=2
// Stealth plugin based on https://www.youtube.com/watch?v=9zwyfrVv3hg&t=203s
// Puppeteer based on https://www.youtube.com/watch?v=4SEXVxn7ayA&list=WL&index=6&t=686s

/// NExt
// WOrks well in local. But when deployed, it timesout. Doesn't seem to even enter the page... Capcha?
