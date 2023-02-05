
const express = require('express');
const portfinder = require('portfinder');
const bodyParser = require('body-parser');
const usersRoutes = require('./routes/users.js');
const auth = require('./auth/basicAuth.js');
const health = require('./health.js');

// import express from 'express';
// import portfinder from 'portfinder';
// import bodyParser from 'body-parser';

// import usersRoutes from './routes/users.js';

// import auth from './auth/basicAuth.js'

// import health from './health.js';

const app = express();

health(app);



app.use(bodyParser.json());
app.use(auth);
app.use('/v1',usersRoutes);

portfinder.getPortPromise()
.then((port) => {
  app.listen(port,()=>console.log(`Example app listening on Port http://localhost:${port}`));
  
})
.catch((err) => {
  console.log(`Not Connected to the any port!`);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/user/create",)



