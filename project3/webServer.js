/**
 * Project 2 Express server connected to MongoDB 'project2'.
 * Start with: node webServer.js
 * Client uses axios to call these endpoints.
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import mongoose from "mongoose";
// eslint-disable-next-line import/no-extraneous-dependencies
import bluebird from "bluebird";
import express from "express";
import multer from "multer";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import session from "express-session";
import { login, currentUser, logout } from "./controllers/adminController.js";
import { commentsOfPhotos, commentDetails, commentCounts } from "./controllers/commentController.js";
import { userPhotos, photoCounts, userPhotoUpload } from "./controllers/photoController.js";
import { info, counts } from "./controllers/testController.js";
import { base, userList, userId, user } from "./controllers/userController.js";

// ToDO - Your submission should work without this line. Comment out or delete this line for tests and before submission!
// import models from "./modelData/photoApp.js";


// Load the Mongoose schema for User, Photo, and SchemaInfo
// ToDO - Your submission will use code below, so make sure to uncomment this line for tests and before submission!


const portno = 3001; // Port number to use
const app = express();

app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(session({
  secret: 'none',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }
  return next();
}

mongoose.Promise = bluebird;
mongoose.set("strictQuery", false);
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/project3";
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));


// Admin Controller
app.post('/admin/login', login);
app.get('/admin/currentUser', currentUser);
app.post('/admin/logout', logout);

// Test Controller
app.get('/test/info', requireLogin, info);
app.get('/test/counts', requireLogin, counts);

// User Controller
app.get('/', requireLogin, base);
app.get('/user/list', requireLogin, userList);
app.get('/user/:id', requireLogin, userId);
app.post('/user', user);

// Photo Controller
app.get('/photosOfUser/:id', requireLogin, userPhotos);
app.get('/usersPhotoCounts', requireLogin, photoCounts);
app.post('/photos/new', requireLogin, upload.single('uploadedphoto'), userPhotoUpload);

// Comment Controller
app.post('/commentsOfPhoto/:photo_id', requireLogin, commentsOfPhotos);
app.get('/usersCommentDetails/:id', requireLogin, commentDetails);
app.get('/usersCommentCounts', requireLogin, commentCounts);


const server = app.listen(portno, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
