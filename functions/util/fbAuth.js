const { db, admin } = require('./admin');

// middleware that adds req.user field with decoded token
module.exports = (req, res, next) => {
    let idToken;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      idToken = req.headers.authorization.split("Bearer ")[1];
    } else {
      return res.status(403).json({ error: "Unauthorized" });
    }

    admin
      .auth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        req.user = decodedToken;
        console.log("decodedToken: " + decodedToken);
        return db
          .collection("users")
          .where("userId", "==", req.user.uid)
          .limit(1)
          .get();
      })
      .then((data) => {
        if (!data.empty) {
          req.user.handle = data.docs[0].id; // id should be the handle
        }
        return next();
      })
      .catch((err) => {
        console.error("Error while verifying token ", err);
        return res.status(403).json(err);
      });
  };