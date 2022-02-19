const express = require('express');
const body_parser = require('body-parser');
const cors = require('cors');

// database connection
const { connectDB, disconnectDB } = require('./database/mongodb_connection');

// routes
const user_routes = require('./routes/user_routes')

const app = express();

const cors_options = {
  origin: "http://localhost:8081"
};

app.use(cors(cors_options));
app.use(body_parser.json());

app.use('/user', user_routes); // user endpoint

connectDB();

const PORT = process.env.PORT || 8080;
server = app.listen(PORT, () => { console.log(`Listening on port: ${PORT}`) });