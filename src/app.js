require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const router = require("./modules/index.controller");
const { errorHandler } = require("./modules/index.middlewares");
const session = require("express-session");

const app = express();
const PORT = 5050;

app.use(morgan("combined"));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(express.json());

app.use(router);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log("Server started to listen at 5050");
});
