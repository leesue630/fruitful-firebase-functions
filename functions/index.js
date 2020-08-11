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
const { getAllFruits, getFruitById } = require("./handlers/fruits");
const { makeRequest } = require("./handlers/requests");

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

// get request for specific fruit
// no request body
// returns JSON object for specified fruit
app.get("/fruits/:fruitId", getFruitById);

// post request for creating user (account) in db
// request body: { user: ..., handle: ... }
// returns success message with 201 status
app.post("/createUser", FBAuth, createUser);

// get request for authenticated user details
//
// returns user details
app.get("/user", FBAuth, getAuthenticatedUser);

// get request for specified user details
//
// returns specified user details
app.get("/user/:handle", getUserDetails);

// post request for making a new fruit request
// request body: { userHandle: ..., fruit: ... }
// returns success message with 201 status
app.post("/request", FBAuth, makeRequest);

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
          pickCount: admin.firestore.FieldValue.increment(-1),
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
