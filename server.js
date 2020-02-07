"use strict";

const express = require("express");
const mongo = require("mongodb");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const url = require("url");
const shortHash = require("short-hash");

const app = express();
const Schema = mongoose.Schema;

// Basic Configuration
let port = process.env.PORT || 3000;

/** this project needs a db !! **/

mongoose.connect(
  process.env.MONGO_URI,
  { useUnifiedTopology: true, useNewUrlParser: true },
  err => {
    if (err) throw err;
    console.log(
      "MongoDB is connecting, con state: " + mongoose.connection.readyState
    );
  }
);
app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: false }));
// use staitc files
app.use("/public", express.static(process.cwd() + "/public"));
// root endpoint
app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Create SCHEMA & MODEL
const urlSchema = new Schema({
  url: String,
  hash: String
});
const Url = mongoose.model("Url", urlSchema);
Url.createIndexes({url: 1, hash: 1});

// API endpoint...
app.post("/api/shorturl/new", function(req, res) {
  // parse req url string into Node Url object
  let originURL = url.parse(req.body.url);
  console.log(originURL);

  // hostname, url validation
  dns.lookup(originURL.hostname, err => {
    if (err || originURL.hostname === null) {
      // host name invalid
      res.json({ error: "invalid URL" });
    } else {
      // host name valid
      Url.findOne({ url: originURL.href })
        .then((doc, err) => {
          if (err) throw err;
          if (!doc) {
            Url.create({
              url: originURL.href,
              hash: shortHash(originURL.href)
            }).then(created => {
              res.json({
                origin_url: created.url,
                short_url: created.hash
              });
            });
          } else {
            // url document has already created
            res.json({
              origin_url: doc.url,
              short_url: doc.hash
            });
          }
        })
        .catch(err => console.error("error:", err));
    }
  });
});

app.get("/api/shorturl/:short_url", function(req, res){
  console.log(req.params.short_url);
  Url.findOne({hash: req.params.short_url})
     .then((doc, err) => {
        if (!doc) {
          res.json({ error: "invalid URL" });
        } else {
          res.redirect(doc.url);
        }
     }).catch(err => console.error("error:", err));
});

app.listen(port, function() {
  console.log("Node.js is listening ... on port " + port);
});
