const { db } = require("../util/admin");

exports.makeRequest = (req, res) => {
  db.collection("fruit-requests")
    .add({ user: req.user.handle, fruit: req.body.fruit })
    .then((doc) => {
      return res.json({
        message: `document ${doc.id} created successfully`,
      });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: "Something went wrong" });
    });
};
