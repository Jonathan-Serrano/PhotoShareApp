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
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ToDO - Your submission should work without this line. Comment out or delete this line for tests and before submission!
// import models from "./modelData/photoApp.js";


// Load the Mongoose schema for User, Photo, and SchemaInfo
// ToDO - Your submission will use code below, so make sure to uncomment this line for tests and before submission!
import User from "./schema/user.js";
import Photo from "./schema/photo.js";
import SchemaInfo from "./schema/schemaInfo.js";
import session from "express-session";

const portno = 3001; // Port number to use
const app = express();

app.use(express.json());

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

app.get("/", requireLogin, function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * /test/info - Returns the SchemaInfo object of the database in JSON format.
 *              This is good for testing connectivity with MongoDB.
 */
app.get('/test/info', requireLogin, async (request, response) => {
  try {
    // Get SchemaInfo
    const info = await SchemaInfo.find();
    return response.status(200).json(info);
  }
  catch (err) {
    return response.status(400).json({ error: 'Schema Info error' });
  }
});

/**
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get('/test/counts', requireLogin, async (request, response) => {

  try {
    // Get counts
    const userCount = await User.countDocuments();
    const photoCount = await Photo.countDocuments();
    const schemaInfoCount = await SchemaInfo.countDocuments();

    // Create response
    return response.status(200).json({
      user: userCount,
      photo: photoCount,
      schemaInfo: schemaInfoCount
    });

  } catch(err){
    return response.status(400).json({ error: 'Counts error' });
  }
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get('/user/list', requireLogin, async (request, response) => {

  try {
    // Find all users
    const users = await User.find().select('_id first_name last_name');
    return response.status(200).json(users);
  } catch (err) {
    return response.status(500).json({ error: 'User list error' });
  }
});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get('/user/:id', requireLogin, async (request, response) => {

  try {
    // Find user by ID
    const user = await User.findById(request.params.id).select('_id first_name last_name location description occupation');
    
    // If user not found
    if (!user) {
      return response.status(400).send("Not found");
    }

    return response.status(200).json(user);
  } catch (err) {
    return response.status(400).json({ error: 'User info error' });
  }
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get('/photosOfUser/:id', requireLogin, async (request, response) => {

  try {
    // Find photos by user ID
    const photos = await Photo.find({ user_id: request.params.id })
      .select('_id user_id comments file_name date_time')
      .lean(); 

    // If no photos found
    if (!photos || photos.length === 0) {
      return response.status(400).send({ error: 'Photos not found' });
    }

    // Get all unique user_ids from comments
    const commentUserIds = new Set();
    photos.forEach(photo => {
      photo.comments.forEach(comment => {
        commentUserIds.add(comment.user_id.toString());
      });
    });

    // Fetch user details for all unique user_ids
    const users = await User.find({ _id: { $in: Array.from(commentUserIds) } })
      .select('_id first_name last_name')
      .lean();

    // Make Comment User Map
    const commentUserMap = {};
    users.forEach(user => {
      commentUserMap[user._id.toString()] = {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name
      };
    });

    // Create corrected comment user info
    photos.forEach(photo => {
      photo.comments.forEach(comment => {
        const userInfo = commentUserMap[comment.user_id.toString()];
        comment.user = userInfo;
        delete comment.user_id;
      });
    });

    return response.status(200).json(photos);
  } catch (err) {
    return response.status(400).json({ error: 'Photos of user error' });
  }
});


/**
 * URL /usersPhotoCount - Returns the Photos Counts for all User objects.
 */
app.get('/usersPhotoCounts', requireLogin, async (request, response) => {

  try {

    // Get alll user IDs
    const users = await User.find().select('_id').lean();

    // Get photo counts
    const photoCounts = await Photo.aggregate([
      { $group: { _id: "$user_id", count: { $sum: 1 } } }
    ]);

    // Create map for user IDs to photo counts
    const userPhotoMap = {};
    photoCounts.forEach(({ _id, count }) => {
      userPhotoMap[_id.toString()] = count;
    });

    // Add users with zero photos
    users.forEach(user => {
      if (!userPhotoMap[user._id.toString()]) {
        userPhotoMap[user._id.toString()] = 0;
      }
    });

    return response.status(200).json(userPhotoMap);
  } catch (err) {
    return response.status(400).json({ error: 'Photos of user error' });
  }
});

/**
 * URL /usersCommentCount - Returns the Comments Counts for all User objects.
 */
app.get('/usersCommentCounts', requireLogin, async (request, response) => {
  try {

    // Get all user IDs
    const users = await User.find().select('_id').lean();

    // Get comment counts
    const commentCounts = await Photo.aggregate([
      { $unwind: "$comments" },
      { $group: { _id: "$comments.user_id", count: { $sum: 1 } } }
    ]);

    // Create map for user IDs to comment counts
    const userCommentMap = {};
    commentCounts.forEach(({ _id, count }) => {
      userCommentMap[_id.toString()] = count;
    });

    // Add users with zero comments
    users.forEach(user => {
      if (!userCommentMap[user._id.toString()]) {
        userCommentMap[user._id.toString()] = 0;
      }
    });

    return response.status(200).json(userCommentMap);
  } catch (err) {
    return response.status(400).json({ error: 'Comments of user error' });
  }
});

/**
 * URL /usersCommentDetails - Returns the Comments Details for given user id.
 */
app.get('/usersCommentDetails/:id', requireLogin, async (request, response) => {
  try {
    const userId = request.params.id;

    // Find photos with comments by the user
    const photos = await Photo.find({ "comments.user_id": userId })
      .select('_id file_name comments user_id')
      .lean();

    // Get photo owner IDs and photo IDs
    const photoOwnerIds = [...new Set(photos.map(p => p.user_id.toString()))];
    const photoIds = new Set(photos.map(p => p._id.toString()));
    const photoIndexMap = new Map();

    // Fetch all owner photos concurrently
    await Promise.all(photoOwnerIds.map(async (ownerId) => {
      const ownerPhotos = await Photo.find({ user_id: ownerId })
        .select('_id')
        .lean();

      // Map photo IDs to the index
      ownerPhotos.forEach((photo, idx) => {
        const photoIdStr = photo._id.toString();
        if (photoIds.has(photoIdStr)) {
          photoIndexMap.set(photoIdStr, idx);
        }
      });
    }));

    // Extract comments made by the user
    const userComments = [];
    photos.forEach((photo) => {
      photo.comments.forEach(comment => {
        if (comment.user_id.toString() === userId) {
          userComments.push({
            photo_index: photoIndexMap.get(photo._id.toString()),
            photo_user_id: photo.user_id,
            photo_id: photo._id,
            file_name: photo.file_name,
            comment: comment.comment,
            date_time: comment.date_time
          });
        }
      });
    });

    return response.status(200).json(userComments);
  } catch (err) {
    return response.status(400).json({ error: 'Comments details error' });
  }
});

app.post("/admin/login", async (request, response) => {
  try {

    const { login_name } = request.body;
    console.log(login_name)
    const user = await User.findOne({ login_name: login_name })
    console.log(user)

    if (!user) {
      return response.status(400).json({ error: "User not found" });
    }

    request.session.user = {
      _id: user._id,
      first_name: user.first_name
    }

    console.log(request.session.user)

    return response.json(request.session.user);
    

  } catch (err) {
    return response.status(500).json({ error: 'login error' });
  }
});

app.get("/admin/currentUser", async (request, response) => {
  try {
    if(!request.session || !request.session.user){
      return response.status(401).json({ error: 'No session found' });
    }
    const user = await User.findById(request.session.user._id).select('_id first_name')
    if (!user) {
      return response.status(400).json({ error: 'No user found' });
    }
    return response.status(200).json(user);
  } catch (err) {
    return response.status(500).json({ error: 'Server error' });
  }
});

app.post("/admin/logout", (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(400).json({ error: "No user Logged in" });
    }

    req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }

    res.clearCookie("connect.sid");

    return res.status(200).json({ message: "User logged out successfully" });
  });
  } catch (err) {
    return response.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /commentsOfPhoto/:photo_id - Add a comment to a photo.
 */
app.post('/commentsOfPhoto/:photo_id', requireLogin, async (request, response) => {
  const { photo_id } = request.params;
  const { comment } = request.body;

  if (!comment || comment.trim() === '') {
    return response.status(400).json({ error: 'Comment cannot be empty' });
  }

  try {
    const photo = await Photo.findById(photo_id).exec();
    if (!photo) {
      return response.status(400).json({ error: 'Photo not found' });
    }

    const newComment = {
      comment,
      date_time: new Date(),
      user_id: request.session.user._id,
    };

    photo.comments.push(newComment);
    await photo.save();

    return response.status(200).json(newComment);
  } catch (err) {
    return response.status(500).json({ error: 'Server error' });
  }
});

const server = app.listen(portno, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
