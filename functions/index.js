const functions = require("firebase-functions");
const app = require("express")();

const FBAuth = require('./util/fbAuth');

const cors = require('cors');
app.use(cors());

const { getPosts, makePost } = require('./handlers/posts');
const { createUser, login, getUserDetails } = require('./handlers/users');

// get request for all posts
// no request body
// returns JSON object of all posts
app.get("/posts", getPosts);

// post request for post for user
// request body: { fruit: ..., userHandle: ... }
// returns success message with doc.id
app.post("/post", FBAuth, makePost);

// post request for creating user (account) in db
// request body: { user: ..., handle: ... }
// returns success message with 201 status
app.post("/createUser", FBAuth, createUser);

// post request for login using google auth credential token
// request body: { google_token: ... }
// returns success message with JWT user token
app.post("/login", login);

app.get('/user/:handle', getUserDetails);

exports.api = functions.https.onRequest(app);
