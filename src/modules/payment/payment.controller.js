const express = require("express");
const paymentService = require("./payment.service");
const { authenticatedOnly } = require("../index.middlewares");

const paymentRouter = express.Router();

paymentRouter.post("/", authenticatedOnly, paymentService.payOrder);

module.exports = paymentRouter;
