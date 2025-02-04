const express = require("express");
const cartService = require("./cart.service");
const { authenticatedOnly } = require("../index.middlewares");

const cartRouter = express.Router();

cartRouter.use(authenticatedOnly);

cartRouter.get("/", cartService.getCart);
cartRouter.put("/add/:productId", cartService.addProductToCart);
cartRouter.delete("/minus/:productId", cartService.minusProductFromCart);
cartRouter.delete("/remove/:productId", cartService.removeProductFromCart);
cartRouter.delete("/clear", cartService.clearCart);

module.exports = cartRouter;
