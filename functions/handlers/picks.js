const { db } = require("../util/admin");

exports.getPicks = (req, res) => {
  db.collection("picks")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let picks = [];
      data.forEach((doc) => {
        picks.push({ ...doc.data(), pickId: doc.id });
      });
      return res.json(picks);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.makePick = (req, res) => {
  db.doc(`/fruits/${req.body.fruit}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const newPick = {
          fruit: req.body.fruit.toLowerCase(),
          userHandle: req.user.handle,
          createdAt: new Date().toISOString(),
          comment: req.body.comment,
        };

        db.collection("picks")
          .add(newPick)
          .then((doc) => {
            return res.json({
              message: `document ${doc.id} created successfully`,
            });
          })
          .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: "Something went wrong" });
          });
      } else {
        return res.status(404).json({ error: "Invalid fruit" });
      }
    });
};

exports.getPicksByFruit = (req, res) => {
  let fruit = req.params.fruit.toLowerCase();
  db.doc(`/fruits/${fruit}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        db.collection("picks")
          .where("fruit", "==", fruit)
          .orderBy("createdAt", "desc")
          .get()
          .then((data) => {
            let picks = [];
            data.forEach((doc) => {
              picks.push({ ...doc.data(), pickId: doc.id });
            });
            return res.json(picks);
          })
          .catch(console.error);
      } else {
        return res.status(404).json({ error: "Invalid fruit" });
      }
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
