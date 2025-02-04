const express = require("express");
const usersService = require("./users.service");

const usersRouter = express.Router();

usersRouter.post("/sign-up", usersService.signUp);
usersRouter.post("/log-in", usersService.logIn);

module.exports = usersRouter;
