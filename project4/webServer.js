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
import http from "http";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Server } from "socket.io";
import session from "express-session";
import { login, currentUser, logout } from "./controllers/adminController.js";
import { commentsOfPhotos, commentDetails, commentCounts, commentDeletion } from "./controllers/commentController.js";
import { userPhotos, photoCounts, mentions, userPhotoUpload, photoDeletion } from "./controllers/photoController.js";
import { info, counts } from "./controllers/testController.js";
import { base, userList, userId, user, userDeletion} from "./controllers/userController.js";
import { favoriteCheckList, addFavorite, removeFavorite } from "./controllers/favoriteController.js";

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
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(session({
  secret: "none",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
}));

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }
  return next();
}

mongoose.Promise = bluebird;
mongoose.set("strictQuery", false);
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/project4";
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
app.post("/admin/login", login);
app.get("/admin/currentUser", currentUser);
app.post("/admin/logout", logout);

// Test Controller
app.get("/test/info", requireLogin, info);
app.get("/test/counts", requireLogin, counts);

// User Controller
app.get("/", requireLogin, base);
app.get("/user/list", requireLogin, userList);
app.get("/user/:id", requireLogin, userId);
app.post("/user", user);
app.delete("/user/:userID", requireLogin, userDeletion);

// Photo Controller
app.get("/photosOfUser/:id", requireLogin, userPhotos);
app.get("/usersPhotoCounts", requireLogin, photoCounts);
app.get("/usersMentions/:id", requireLogin, mentions);
app.post("/photos/new", requireLogin, upload.single("uploadedphoto"), userPhotoUpload);
app.delete("/photoDeletion/:photoId", requireLogin, photoDeletion);

// Comment Controller
app.post("/commentsOfPhoto/:photo_id", requireLogin, commentsOfPhotos);
app.get("/usersCommentDetails/:id", requireLogin, commentDetails);
app.get("/usersCommentCounts", requireLogin, commentCounts);
app.delete("/commentDeletion/:photoId/:commentId", requireLogin, commentDeletion);

// Favorite Controller
app.get("/favoriteCheck", requireLogin, favoriteCheckList);
app.post("/favorite", requireLogin, addFavorite);
app.delete("/favorite/:photoId", requireLogin, removeFavorite);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // React app
    credentials: true,
  },
});
export default io;

export const getIo = () => io;

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("watchMentions", ({ userId }) => {
    if (!userId) return;
    socket.join(`user:${userId}`);
    console.log(`Socket ${socket.id} joined room user:${userId}`);
  });

  socket.on("unwatchMentions", ({ userId }) => {
    if (!userId) return;
    socket.leave(`user:${userId}`);
    console.log(`Socket ${socket.id} left room user:${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

server.listen(portno, () => {
  console.log(
    "Listening at http://localhost:" +
      portno +
      " exporting the directory " +
      __dirname,
  );
});
