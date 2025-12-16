import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
  // The ID of the user who favorited the photo.
  user_id: mongoose.Schema.Types.ObjectId,
  // The ID of the photo that was liked
  photo_id: { type: mongoose.Schema.Types.ObjectId, ref: "Photo" },
  // The date and time when the photo was added to the database.
  date_time: { type: Date, default: Date.now },
});

/**
 * Create a Mongoose Model for a User using the userSchema.
 */
const Favorite = mongoose.model("Favorite", favoriteSchema);

/**
 * Make this available to our application.
 */
export default Favorite;
