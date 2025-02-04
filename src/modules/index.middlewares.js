function errorHandler(err, req, res, next) {
  console.error("에러 발생...", err);

  let [status, message] = err.split("/");
  status = Number(status);

  if (!NaN(status)) return res.status(500).send("Unkown error");

  res.status(status).send(message);
}

function authenticatedOnly(req, res, next) {
  try {
    if (req.url === "/users/sign-up" || req.url === "/users/log-in") return next();
    const userId = req.session.userId;
    const isAuthenticated = !!userId;

    if (!isAuthenticated) throw new Error("401/Unauthenticated");

    next();
  } catch (e) {
    next(e);
  }
}

module.exports = {
  errorHandler,
  authenticatedOnly,
};
