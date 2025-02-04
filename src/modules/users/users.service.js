const validator = require("validator");
const prisma = require("../../db/prisma/client");
const bcrypt = require("bcrypt");

async function signUp(req, res, next) {
  try {
    const { email, password, nickname } = req.body;
    if (!validator.isEmail(email)) throw new Error("400/Malformed email");
    if (!validator.isLength(password, { min: 8 })) throw new Error("400/password should be at least 8 characters");
    if (!validator.isLength(nickname, { min: 1, max: 20 })) throw new Error("400/nickname should be between 1 and 20 characters");

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error("400/Already uesd email");

    const encryptedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({ data: { email, encryptedPassword, nickname }, omit: { encryptedPassword: true } });
    const cart = await prisma.cart.create({ data: { userId: user.id } });

    res.status(201).json(user);
  } catch (e) {
    next(e);
  }
}

async function logIn(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!validator.isEmail(email)) throw new Error("400/Malformed email");
    if (!validator.isLength(password, { min: 8 })) throw new Error("400/password should be at least 8 characters");
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("404/No user found");

    const isPasswordCorrect = await bcrypt.compare(password, user.encryptedPassword);

    if (!isPasswordCorrect) throw new Error("400/Wrong password");

    req.session.userId = user.id;

    console.log(req.session);
    res.send("OK");
  } catch (e) {
    next(e);
  }
}
const usersService = {
  signUp,
  logIn,
};

module.exports = usersService;
