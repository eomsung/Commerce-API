const express = require("express");
const { authenticatedOnly } = require("../index.middlewares");
const ordersService = require("./orders.service");

const ordersRouter = express.Router();

ordersRouter.use(authenticatedOnly);

ordersRouter.post("/", ordersService.order);
// ordersRouter.get("/", (req,res)=>{res.send("200")});
ordersRouter.get("/", ordersService.getOrderHistory);
ordersRouter.delete("/:orderId/cancel", ordersService.cancelOrder);
ordersRouter.delete("/:orderId/cancel/:orderItemId", ordersService.cancelOrderItem);

module.exports = ordersRouter;
