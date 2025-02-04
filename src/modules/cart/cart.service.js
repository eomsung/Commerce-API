const prisma = require("../../db/prisma/client");

async function getCart(req, res, next) {
  try {
    const userId = req.session.userId;
    if (!userId) throw new Error("401/Unauthorized");

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { cartItems: { include: { product: { include: { category: true } } } } },
    });
    const cartItems = cart.cartItems;

    const totalPrice = cartItems.reduce((prev, cartItem) => {
      return prev + cartItem.quantity * cartItem.product.finalPrice;
    }, 0);

    const result = { cartItems, totalPrice };

    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}

async function addProductToCart(req, res, next) {
  try {
    const userId = req.session.userId;
    const productId = req.params.productId;

    const cart = await prisma.cart.findUnique({ where: { userId } });
    const cartId = cart.id;

    const cartItem = await prisma.cartItem.findFirst({ where: { cartId, productId } });

    if (cartItem) {
      await prisma.cartItem.update({ where: { id: cartItem.id }, data: { quantity: { increment: 1 } } });
    } else {
      await prisma.cartItem.create({ data: { cartId, productId } });
    }

    res.status(201).send();
  } catch (e) {
    next(e);
  }
}

async function minusProductFromCart(req, res, next) {
  try {
    const userId = req.session.userId;
    const productId = req.params.productId;

    const cart = await prisma.cart.findUnique({ where: { userId } });
    const cartId = cart.id;

    const cartItem = await prisma.cartItem.findFirst({ where: { cartId, productId } });
    if (!cartItem) throw new Error("404/No cartItem found");

    if (cartItem.quantity === 1) {
      await prisma.cartItem.delete({ data: { cartId, productId } });
    } else {
      await prisma.cartItem.update({ where: { id: cartItem.id }, data: { quantity: { decrement: 1 } } });
    }

    res.status(201).send();
  } catch (e) {
    next(e);
  }
}

async function removeProductFromCart(req, res, next) {
  try {
    const userId = req.session.userId;
    const productId = req.params.productId;

    const cart = await prisma.cart.findUnique({ where: { userId } });
    const cartId = cart.id;

    const cartItem = await prisma.cartItem.findFirst({ where: { cartId, productId } });
    if (!cartItem) throw new Error("404/No cartItem found");

    await prisma.cartItem.delete({ data: { cartId, productId } });

    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

async function clearCart(req, res, next) {
  try {
    const userId = req.session.userId;
    const cart = await prisma.cart.findUnique({ where: { userId } });
    const cartId = cart.id;
    await prisma.cartItem.deleteMany({ where: { cartId } });

    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

const cartService = {
  getCart,
  addProductToCart,
  minusProductFromCart,
  removeProductFromCart,
  clearCart,
};

module.exports = cartService;
