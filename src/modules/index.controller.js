const express = require("express");
const usersRouter = require("./users/users.controller");
const productsRouter = require("./products/products.controller");
const cartRouter = require("./cart/cart.controller");
const ordersRouter = require("./orders/orders.controller");
const paymentRouter = require("./payment/payment.controller");

const router = express.Router();

router.use("/users", usersRouter);
router.use("/products", productsRouter);
router.use("/cart", cartRouter);
router.use("/orders", ordersRouter);
router.use("/payment", paymentRouter);

module.exports = router;
