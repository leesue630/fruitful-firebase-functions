const functions = require("firebase-functions");
const config = require("./util/config");
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

const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const myOAuth2Client = new OAuth2(config.clientID, config.clientSecret);
myOAuth2Client.setCredentials({
  refresh_token: config.refreshToken,
});
const myAccessToken = myOAuth2Client.getAccessToken();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: config.email,
    clientId: config.clientID,
    clientSecret: config.clientSecret,
    refreshToken: config.refreshToken,
    accessToken: myAccessToken,
  },
});

exports.sendEmailOnFruitRequest = functions.firestore
  .document("fruit-requests/{id}")
  .onCreate((snapshot) => {
    const mailOptions = {
      from: config.email,
      to: config.email,
      subject: "New Fruit Request | Fruitful Firebase",
      text: `Fruit: ${snapshot.data().fruit}, User: ${
        snapshot.data().userHandle
      }`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  });
