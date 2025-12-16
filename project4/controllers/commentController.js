import mongoose from "mongoose";

import User from "../schema/user.js";
import Photo from "../schema/photo.js";

/**
 * POST /commentsOfPhoto/:photo_id - Add a comment to a photo.
 */
export const commentsOfPhotos = async (request, response) => {
  const { photo_id } = request.params;
  const { comment, mentions = [] } = request.body;

  if (!comment || comment.trim() === "") {
    return response.status(400).json({ error: "Comment cannot be empty" });
  }

  try {
    const photo = await Photo.findById(photo_id).exec();
    if (!photo) {
      return response.status(400).json({ error: "Photo not found" });
    }

    const validMentionIds = mentions
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const newComment = {
      comment,
      date_time: new Date(),
      user_id: request.session.user._id,
      mentions: validMentionIds,
    };

    photo.comments.push(newComment);
    await photo.save();

    return response.status(200).json(newComment);
  } catch (err) {
    return response.status(500).json({ error: "Server error" });
  }
};

/**
 * URL /usersCommentDetails - Returns the Comments Details for given user id.
 */
export const commentDetails = async (request, response) => {
  try {
    const userId = request.params.id;

    // Find photos with comments by the user
    const photos = await Photo.find({ "comments.user_id": userId })
      .select("_id file_name comments user_id")
      .lean();

    // Get photo owner IDs and photo IDs
    const photoOwnerIds = [...new Set(photos.map((p) => p.user_id.toString()))];
    const photoIds = new Set(photos.map((p) => p._id.toString()));
    const photoIndexMap = new Map();

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

    // Extract comments made by the user
    const userComments = [];
    photos.forEach((photo) => {
      photo.comments.forEach((comment) => {
        if (comment.user_id.toString() === userId) {
          userComments.push({
            photo_index: photoIndexMap.get(photo._id.toString()),
            photo_user_id: photo.user_id,
            photo_id: photo._id,
            file_name: photo.file_name,
            comment: comment.comment,
            date_time: comment.date_time,
          });
        }
      });
    });

    return response.status(200).json(userComments);
  } catch (err) {
    return response.status(400).json({ error: "Comments details error" });
  }
};

/**
 * URL /usersCommentCount - Returns the Comments Counts for all User objects.
 */
export const commentCounts = async (request, response) => {
  try {

    // Get all user IDs
    const users = await User.find().select("_id").lean();

    // Get comment counts
    const allCommentCounts = await Photo.aggregate([
      { $unwind: "$comments" },
      { $group: { _id: "$comments.user_id", count: { $sum: 1 } } },
    ]);

    // Create map for user IDs to comment counts
    const userCommentMap = {};
    allCommentCounts.forEach(({ _id, count }) => {
      userCommentMap[_id.toString()] = count;
    });

    // Add users with zero comments
    users.forEach((user) => {
      if (!userCommentMap[user._id.toString()]) {
        userCommentMap[user._id.toString()] = 0;
      }
    });

    return response.status(200).json(userCommentMap);
  } catch (err) {
    return response.status(400).json({ error: "Comments of user error" });
  }
};