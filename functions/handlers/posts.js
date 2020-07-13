const { db } = require("../util/admin");
const { getAllFruits } = require("./fruits");

exports.getPosts = (req, res) => {
  db.collection("posts")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let posts = [];
      data.forEach((doc) => {
        posts.push({ ...doc.data(), postId: doc.id });
      });
      return res.json(posts);
    })
    .catch(console.error);
};

exports.makePost = (req, res) => {
  db.doc(`/fruits/${req.body.fruit}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const newPost = {
          fruit: req.body.fruit,
          userHandle: req.user.handle,
          createdAt: new Date().toISOString(),
          comment: req.body.comment,
        };

        db.collection("posts")
          .add(newPost)
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

exports.getPostsByFruit = (req, res) => {
  db.doc(`/fruits/${req.params.fruit}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        db.collection("posts")
          .where("fruit", "==", req.params.fruit)
          .orderBy("createdAt", "desc")
          .get()
          .then((data) => {
            let posts = [];
            data.forEach((doc) => {
              posts.push({ ...doc.data(), postId: doc.id });
            });
            return res.json(posts);
          })
          .catch(console.error);
      } else {
        return res.status(404).json({ error: "Invalid fruit" });
      }
    });
};

exports.getRankings = (req, res) => {
  getAllFruits.then((fruits) => {
    db.collection("posts")
      .select(["fruit"])
      .get()
      .then((posts) => {
        let counts = fruits.reduce((acc, fruit) =>
          Object.assign(acc, { [fruit]: 0 })
        );
        for (var i = 0; i < posts.data.length; i++) {
          counts[fruits.data[i]]++;
        }
        return res.json(
          Object.entries(counts).sort((a, b) =>
            Math.min(a[Object.keys(a)[0]], b[Object.keys(b)[0]])
          )
        );
      });
  });
};
