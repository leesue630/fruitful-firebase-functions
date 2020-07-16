const { db } = require("../util/admin");

exports.getAllFruits = (req, res) => {
  db.collection("fruits")
    .orderBy("name", "asc")
    .get()
    .then((data) => {
      return res.json(
        data.docs.map((doc) => {
          return { ...doc.data(), id: doc.id };
        })
      );
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
