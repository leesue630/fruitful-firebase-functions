const { db, admin } = require("./admin");

// middleware that adds req.user field with decoded token
module.exports = (req, res, next) => {
  console.log("req.headers.authorization", req.headers.authorization);
  let idToken = "";
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    idToken = req.headers.authorization.split("Bearer ")[1];
    console.log(idToken);
  } else {
    return res.status(403).json({ error: "Unauthorized" });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedToken => {
      req.user = decodedToken;
      return db
        .collection("users")
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get();
    })
    .then(data => {
      if (!data.empty) {
        req.user.handle = data.docs[0].id; // id should be the handle
      }
      return next();
    })
    .catch(err => {
      console.error("Error while verifying token ", err);
      console.error("JWT Token ", idToken);
      return res.status(403).json(err);
    });
};
