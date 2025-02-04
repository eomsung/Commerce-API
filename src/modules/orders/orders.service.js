const prisma = require("../../db/prisma/client");

async function order(req, res, next) {
  try {
    const userId = req.session.userId;

    const cart = await prisma.cart.findUnique({ where: { userId }, include: { cartItems: { include: { product: true } } } });
    const cartItems = cart.cartItems;

    if (cartItems.length === 0) throw new Error("400/No items to order");
    const { customerName, customerPhoneNumber, customerAddress } = req.body;
    const order = await prisma.order.create({ data: { userId, customerName, customerPhoneNumber, customerAddress } });

    const createOrderItemPromises = cartItems.map(async (cartItem) => {
      const finalPrice = cartItem.product.finalPrice;
      const quantity = cartItem.quantity;
      const totalAmount = finalPrice * quantity;
      const productId = cartItem.productId;
      const productInfo = JSON.stringify(cartItem.product);

      //구매한 Product들의 stock 차감
      prisma.product.update({ where: { id: productId }, data: { stock: { decrement: quantity } } });

      return await prisma.orderItem.create({
        data: { userId, orderId: order.id, finalPrice, quantity: quantity, totalAmount, productId, productInfo },
      });
    });

    const orderItems = await Promise.all(createOrderItemPromises);

    const totalAmount = orderItems.reduce((prev, orderItem) => prev + orderItem.totalAmount, 0);

    const updatedOrder = await prisma.order.update({ where: { id: order.id }, data: { totalAmount } });

    //장바구니 비워주기
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    res.status(201).json(updatedOrder);
  } catch (e) {
    next(e);
  }
}

async function getOrderHistory(req, res, next) {
  try {
    const userId = req.session.userId;

    const orders = await prisma.order.findMany({ where: { userId }, include: { orderItems: true }, orderBy: { createdAt: "desc" } });

    res.status(200).json(orders);
  } catch (e) {
    next(e);
  }
}

async function cancelOrder(req, res, next) {
  try {
    const userId = req.session.userId;
    const orderId = req.params.orderId; // 주문 아이디

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("404/No order found");
    if (order.userId !== userId) throw new Error("401/Unauthorized");
    if (order.status !== "success") throw new Error("400/Bad request");

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { refundedAmount: order.paidAmount, balanceAmount: 0, status: "cancelled" },
    });
    await prisma.orderItem.updateMany({ where: { orderId }, data: { status: "cancelled" } });

    res.status(200).send(updatedOrder);
  } catch (e) {
    next(e);
  }
}

async function cancelOrderItem(req, res, next) {
  try {
    const userId = req.session.userId;
    const orderId = req.params.orderId;
    const orderItemId = req.params.orderItemId;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("404/No order found");
    if (order.userId !== userId) throw new Error("401/Unauthorized");
    if (order.status === "pending" || order.status === "cancelled") throw new Error("400/Bad request");

    const orderItem = await prisma.orderItem.findUnique({ where: { id: orderItemId } });
    if (!orderItem) throw new Error("404/No orderItem found");
    if (orderItem.userId !== userId) throw new Error("401/Unauthorized");
    if (orderItem.orderId !== orderId) throw new Error("400/Bad request1");
    if (orderItem.status !== "success") throw new Error("400/Bad request2");

    let updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        refundedAmount: { increment: orderItem.totalAmount },
        balanceAmount: { decrement: orderItem.totalAmount },
        status: "partiallyCanceled",
      },
    });
    if (updatedOrder.balanceAmount === 0) {
      updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: "cancelled" },
      });
    }

    await prisma.orderItem.updateMany({ where: { id: orderItemId }, data: { status: "cancelled" } });

    res.status(200).json(updatedOrder);
  } catch (e) {
    next(e);
  }
}

const ordersService = {
  order,
  getOrderHistory,
  cancelOrder,
  cancelOrderItem,
};

module.exports = ordersService;
