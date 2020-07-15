const { db } = require("../util/admin");

exports.getAllFruits = (req, res) => {
  db.collection("fruits")
    .orderBy("name", "asc")
    .get()
    .then((data) => {
      return res.json(data.docs.map((doc) => doc.data()));
    })
    .catch(console.error);
};
