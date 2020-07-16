const { db } = require("../util/admin");

exports.getAllFruits = (req, res) => {
  db.collection("fruits")
    .orderBy("name", "asc")
    .get()
    .then((data) => {
      return res.json(
        data.docs.map((doc, i) => {
          return { ...doc.data(), id: doc.id, ranking: i + 1 };
        })
      );
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.getFruitById = (req, res) => {
  db.doc(`/fruits/${req.params.fruitId}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.json({ ...doc.data(), id: doc.id });
      } else {
        return res.status(404).json({ error: "Invalid fruit" });
      }
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
