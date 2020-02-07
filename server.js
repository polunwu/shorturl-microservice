'use strict';

const express = require('express');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');

const app = express();

// Basic Configuration 
let port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGO_URI, { useUnifiedTopology: true, useNewUrlParser: true });
app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// API endpoint... 
app.post("/api/shorturl/new", function (req, res) {
  let url = req.body.url;
  
  // invalid url
  dns.lookup('freecodecamp.org', (err) => {
    if (err) {
      // host name invalid
      console.error(err);
      res.json({error: "invalid URL"});
    } else {
      res.json({origin_url: url});
    }
  });
  
});

app.listen(port, function () {
  console.log('Node.js listening ... on port ' + port);
});