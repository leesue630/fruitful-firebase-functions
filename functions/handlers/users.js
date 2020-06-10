const { db } = require("../util/admin");

const firebaseConfig = require("../util/config");

const firebase = require("firebase");
firebase.initializeApp(firebaseConfig);

exports.createUser = (req, res) => {
  db.doc(`/users/${req.body.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ handle: "This handle is already taken" });
      } else {
        const userCredentials = {
          handle: req.body.handle,
          email: req.user.email,
          createdAt: new Date().toISOString(),
          userId: req.user.uid,
        };
        return db.doc(`/users/${userCredentials.handle}`).set(userCredentials);
      }
    })
    .then(() => {
      return res
        .status(201)
        .json({ message: `User handle created successfully` });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.login = (req, res) => {
  let google_token = req.body.google_token;
  // console.log("google_token: " + google_token);
  let token;
  // Build Firebase credential with the Google ID token.
  const credential = firebase.auth.GoogleAuthProvider.credential(google_token);

  // Sign in with credential from the Google user.
  firebase
    .auth()
    .signInWithCredential(credential)
    .catch((err) => {
      console.error(err);
      return res.status(400).json({ error: "login failed" });
    })
    .then((data) => {
      token = data.user.getIdToken();
      return db.collection("users").where("email", "==", data.user.email).get();
    })
    .then((doc) => {
      if (doc.exists) {
        // account with handle existed
        return res.json({ token });
      } else {
        // user newly created
        return res.status(201).json({ token });
      }
    });
};

// Get any user's details
exports.getUserDetails = (req, res) => {
  let userData = {};
  db.doc(`/users/${req.params.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData.user = { ...doc.data(), handle: doc.id };
        return db
          .collection("posts")
          .where("userHandle", "==", req.params.handle)
          .orderBy("createdAt", "desc")
          .get();
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    })
    .then((data) => {
      userData.posts = [];
      data.forEach((doc) => {
        userData.posts.push({
          ...doc.data(),
          postId: doc.id,
        });
      });
      return res.json(userData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.getAuthenticatedUser = (req, res) => {
  if (req.user.handle) {
    return res.json({ handle: req.user.handle });
  } else {
    return res.status(404).json({ error: "User account doesn't exist yet" });
  }
  // let userData = {};
  // db.doc(`/users/${req.user.handle}`)
  //   .get()
  //   .then((doc) => {
  //     if (doc.exists) {
  //       userData.credentials = doc.data();
  //       return db
  //         .collection("likes")
  //         .where("userHandle", "==", req.user.handle)
  //         .get();
  //     }
  //   })
  //   .catch((err) => {
  //     console.error(err);
  //
  //   });
};