const prisma = require("../../db/prisma/client");

async function payOrder(req, res, next) {
  try {
    const userId = req.session.userId;
    const { orderId, amount } = req.body;

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) throw new Error("400/No order found");
    if (order.userId !== userId) throw new Error("401/Unauthorized");
    if (order.totalAmount !== amount) throw new Error("400/Bad request");

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: "success", paidAmount: amount, balanceAmount: amount },
    });
    await prisma.orderItem.updateMany({
      where: { orderId: orderId },
      data: { status: "success" },
    });
    res.json(updatedOrder);
  } catch (e) {
    next(e);
  }
}

const paymentService = {
  payOrder,
};

module.exports = paymentService;
