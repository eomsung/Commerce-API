const express = require("express");
const productsService = require("./products.service");

const productsRouter = express.Router();

productsRouter.get("/", productsService.getProducts);

module.exports = productsRouter;
