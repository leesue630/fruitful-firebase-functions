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
          fruit: req.body.fruit.toLowerCase(),
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
  let fruit = req.params.fruit.toLowerCase();
  db.doc(`/fruits/${fruit}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        db.collection("posts")
          .where("fruit", "==", fruit)
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
  db.collection("fruits")
    .orderBy("name", "asc")
    .select("name")
    .get()
    .then((fruitsData) => {
      db.collection("posts")
        .select("fruit")
        .get()
        .then((postsData) => {
          let counts = {};
          fruitsData.forEach((fruit) => {
            counts[fruit.id] = 0;
          });
          for (var i = 0; i < postsData.size; i++) {
            counts[postsData.docs[i].get("fruit")]++;
          }
          let fruits = [];
          for (var fruit in counts) {
            fruits.push({ [fruit]: counts[fruit] });
          }
          return res.json(
            fruits.sort((a, b) => a[Object.keys(a)[0]] - b[Object.keys(b)[0]])
          );
        });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: "Something went wrong" });
    });
};
