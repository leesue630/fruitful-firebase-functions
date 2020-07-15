const functions = require("firebase-functions");
const app = require("express")();
const { admin, db } = require("./util/admin");

const FBAuth = require("./util/fbAuth");

const cors = require("cors");
app.use(cors());

const { getPicks, makePick, getPicksByFruit } = require("./handlers/picks");
const {
  createUser,
  login,
  getUserDetails,
  getAuthenticatedUser,
} = require("./handlers/users");
const { getAllFruits } = require("./handlers/fruits");

// get request for all picks
// no request body
// returns JSON object of all picks
app.get("/picks", getPicks);

// get request for all picks with specified fruit
// no request body
// returns JSON object of all picks with 'fruit'
app.get("/picks/:fruit", getPicksByFruit);

// pick request for pick for user
// request body: { fruit: ..., userHandle: ... }
// returns success message with doc.id
app.post("/pick", FBAuth, makePick);

// get request for all fruits
// no request body
// returns JSON object of all fruits
app.get("/fruits", getAllFruits);

// pick request for creating user (account) in db
// request body: { user: ..., handle: ... }
// returns success message with 201 status
app.post("/createUser", FBAuth, createUser);

// pick request for login using google auth credential token
// request body: { google_token: ... }
// returns success message with JWT user token
app.post("/login", login);

app.get("/user", FBAuth, getAuthenticatedUser);

app.get("/user/:handle", getUserDetails);

exports.api = functions.https.onRequest(app);

exports.updateUserOnPick = functions.firestore
  .document("picks/{id}")
  .onCreate((snapshot) => {
    return db
      .doc(`/users/${snapshot.data().userHandle}`)
      .update({
        currentPick: snapshot.data().fruit,
      })
      .catch((err) => console.error(err));
  });

exports.incrementFruitPickCountOnUserUpdate = functions.firestore
  .document("users/{handle}")
  .onUpdate((snapshot) => {
    if (snapshot.before.data().hasOwnProperty("currentPick")) {
      db.doc(`/fruits/${snapshot.before.data().currentPick}`)
        .update({
          pickCount: admin.firestore.FieldValue.decrement(1),
        })
        .catch((err) => console.error(err));
    }
    return db
      .doc(`/fruits/${snapshot.after.data().currentPick}`)
      .update({
        pickCount: admin.firestore.FieldValue.increment(1),
      })
      .catch((err) => console.error(err));
  });
