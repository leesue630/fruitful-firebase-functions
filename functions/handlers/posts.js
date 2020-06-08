const { db } = require('../util/admin');

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
    const newPost = {
      fruit: req.body.fruit,
      userHandle: req.user.handle,
      createdAt: new Date().toISOString(),
    };

    db.collection("posts")
      .add(newPost)
      .then((doc) => {
        res.json({ message: `document ${doc.id} created successfully` });
      })
      .catch((err) => {
        res.status(500).json({ error: "Something went wrong" });
        console.error(err);
      });
  };