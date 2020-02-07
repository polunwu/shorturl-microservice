'use strict';

const express = require('express');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const url = require('url');
const shortHash = require('short-hash');

const app = express();
const Schema = mongoose.Schema;

// Basic Configuration 
let port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGO_URI, { useUnifiedTopology: true, useNewUrlParser: true }, (err) => {
  if (err) throw err;
  console.log('MongoDB is connecting, con state: ' + mongoose.connection.readyState);
});
app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: false}));
// use staitc files
app.use('/public', express.static(process.cwd() + '/public'));
// root endpoint
app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});


// Create SCHEMA & MODEL
let urlSchema = new Schema({
  url: String,
  hash: String
});
let Url = mongoose.model('Url', urlSchema);

  
// API endpoint... 
app.post("/api/shorturl/new", function (req, res) {
  // parse req url string into Node Url object
  let originURL = url.parse(req.body.url);
  console.log(originURL);
  
  // hostname, url validation
  dns.lookup(originURL.hostname, (err) => {
    if (err || originURL.hostname === null) {
      // host name invalid
      console.error(err);
      res.json({error: "invalid URL"});
    } else {
      // valid
      Url.find({url: originURL.href})
         .then((err, data) => {
            if (err) throw err;
            console.log(data);
          }).catch((err) => console.error(err));
      
      res.json({
        hostname: originURL.hostname, 
        origin_url: originURL.href
      });
    }
  });
  
});

app.listen(port, function () {
  console.log('Node.js is listening ... on port ' + port);
});