const prisma = require("../../db/prisma/client");

async function getProducts(req, res, next) {
  try {
    const category = req.query.category;
    let products = [];
    if (category) {
      products = await prisma.product.findMany({
        include: { category: true },
        where: { category: { name: category } },
        orderBy: { createdAt: "desc" },
      });
    } else {
      products = await prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } });
    }

    res.status(200).json(products);
  } catch (e) {
    next(e);
  }
}

const productsService = {
  getProducts,
};

module.exports = productsService;
