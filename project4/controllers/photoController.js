import { join,dirname } from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import User from "../schema/user.js";
import Photo from "../schema/photo.js";
import Favorite from "../schema/favorite.js";





const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */

export const userPhotos = async (request, response) => {

  try {
    // Find photos by user ID
    const photos = await Photo.find({ user_id: request.params.id })
      .select("_id user_id comments file_name date_time")
      .lean();

    // If no photos found
    if (!photos) {
      return response.status(400).send({ error: "Photos not found" });
    }

    // Get all unique user_ids from comments
    const commentUserIds = new Set();
    photos.forEach((photo) => {
      photo.comments.forEach((comment) => {
        commentUserIds.add(comment.user_id.toString());
      });
    });

    // Fetch user details for all unique user_ids
    const users = await User.find({ _id: { $in: Array.from(commentUserIds) } })
      .select("_id first_name last_name")
      .lean();

    // Make Comment User Map
    const commentUserMap = {};
    users.forEach((user) => {
      commentUserMap[user._id.toString()] = {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
      };
    });

    // Create corrected comment user info
    photos.forEach((photo) => {
      photo.comments.forEach((comment) => {
        const userInfo = commentUserMap[comment.user_id.toString()];
        comment.user = userInfo;
        delete comment.user_id;
      });
    });

    return response.status(200).json(photos);
  } catch (err) {
    return response.status(400).json({ error: "Photos of user error" });
  }
};


/**
 * URL /usersPhotoCount - Returns the Photos Counts for all User objects.
 */
export const photoCounts = async (request, response) => {

  try {

    // Get alll user IDs
    const users = await User.find().select("_id").lean();

    // Get photo counts
    const allPhotoCounts = await Photo.aggregate([
      { $group: { _id: "$user_id", count: { $sum: 1 } } },
    ]);

    // Create map for user IDs to photo counts
    const userPhotoMap = {};
    allPhotoCounts.forEach(({ _id, count }) => {
      userPhotoMap[_id.toString()] = count;
    });

    // Add users with zero photos
    users.forEach((user) => {
      if (!userPhotoMap[user._id.toString()]) {
        userPhotoMap[user._id.toString()] = 0;
      }
    });

    return response.status(200).json(userPhotoMap);
  } catch (err) {
    return response.status(400).json({ error: "Photos of user error" });
  }
};

/**
 * URL /usersMentions - Returns the Photos mentioning User (id).
 */
export const mentions = async (request, response) => {
  try {
    const userId = request.params.id;

    const photos = await Photo.find({ "comments.mentions": userId })
      .select("_id user_id comments file_name date_time")
      .lean();

    // Get photo owner IDs and photo IDs
    const photoOwnerIds = [...new Set(photos.map((p) => p.user_id.toString()))];
    const photoIds = new Set(photos.map((p) => p._id.toString()));
    const photoIndexMap = new Map();

    // Fetch user details for all unique user_ids
    const users = await User.find({ _id: { $in: photoOwnerIds } })
      .select("_id first_name last_name")
      .lean();

    // Make User Map
    const userMap = {};
    users.forEach((user) => {
      userMap[user._id.toString()] = {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
      };
    });

    // Fetch all owner photos concurrently
    await Promise.all(photoOwnerIds.map(async (ownerId) => {
      const ownerPhotos = await Photo.find({ user_id: ownerId })
        .select("_id")
        .lean();

      // Map photo IDs to the index
      ownerPhotos.forEach((photo, idx) => {
        const photoIdStr = photo._id.toString();
        if (photoIds.has(photoIdStr)) {
          photoIndexMap.set(photoIdStr, idx);
        }
      });
    }));

    // Extract comments that mention the user
    const userMentions = [];
    photos.forEach((photo) => {
      (photo.comments || []).forEach((comment) => {
        // Check if the comment mentions the user
        (comment.mentions || []).forEach((mentionId) => {
          if (mentionId.toString() === userId) {
            userMentions.push({
              photo_index: photoIndexMap.get(photo._id.toString()),
              user: userMap[photo.user_id.toString()],
              photo_id: photo._id,
              file_name: photo.file_name,
              comment: comment.comment,
              date_time: comment.date_time,
            });
          }
        });
      });
    });

    return response.status(200).json(userMentions);
  } catch (err) {
    return response.status(400).json({ error: "Photos with mentions error" });
  }
};

/**
 * POST /photos/new - Upload a photo.
 */
export const userPhotoUpload = async (request, response) => {
  // Validate file
  if (!request.file) {
    return response.status(400).json({ error: "No file uploaded" });
  }

  try {
    const timestamp = Date.now();
    const filename = `U${timestamp}-${request.file.originalname}`;

    const filePath = join(ROOT_DIR, "images", filename);
    await fs.writeFile(filePath, request.file.buffer);

    const newPhoto = new Photo({
      file_name: filename,
      user_id: request.session.user._id,
      date_time: new Date(),
    });

    await newPhoto.save();

    return response.status(200).json(newPhoto);
  } catch (err) {
    return response.status(500).json({ error: "Server error" });
  }
};


/**
 * DELETE URL /photoDeletion/:photoId - delete a photo.
 */
export const photoDeletion = async (request, response) => {  
  try {
    const userId = request.session.user._id;
    const { photoId } = request.params;

    const photo = await Photo.findOneAndDelete({
      _id: photoId,
      user_id: userId,
    });

    if (!photo) {
      return response.status(403).json({
        error: "Photo not found",
      });
    }

    // Path 
    const filePath = join(ROOT_DIR, "images", photo.file_name);

    // Delete File
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.warn("file not found", err.message);
    }

    // Delete Favorites of this photo
    await Favorite.deleteMany({ photo_id: photoId });

    return response.status(200).json({message: "Comment was deleted sucessfully"});
  } catch (err) {
    return response.status(500).json({ error: "Server error" });
  }
};