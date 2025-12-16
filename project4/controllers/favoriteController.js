import Favorite from "../schema/favorite.js";


/**
 * URL /favoriteCheck - Returns all the User favorites.
 */
export const favoriteCheckList = async (request, response) => {

  try {
    // Find all favorites photos by user
    const favs = await Favorite.find({ user_id: request.session.user._id })
      .select("_id user_id photo_id date_time")
      .populate({
        path: "photo_id",
        select: "file_name",
      });
    return response.status(200).json(favs);
  } catch (err) {
    return response.status(500).json({ error: "User list error" });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const userId = req.session.user._id;
    console.log(req.body);
    const { photo_id, date_time } = req.body;
    const favorite = await Favorite.create({
      user_id: userId,
      photo_id: photo_id,
      date_time: date_time,
    });

    res.status(200).json(favorite);
  } catch (err) {
    // // ignore duplicate favorites
    // if (err.code === 11000) {
    //   return res.status(200).json({});
    // }
    res.status(500).json({ error: "Add favorite error" });
  }
};

export async function removeFavorite(req, res) {
  try {
    const userId = req.session.user._id;
    const { photoId } = req.params;

    const result = await Favorite.deleteOne({
      user_id: userId,
      photo_id: photoId,
    });

    if (result.deletedCount === 0) {
      return res.status(400).send({ error: "Favorite not found" });
    }

    return res.status(200).send({ message: "Removed from favorites" });
  } catch (err) {
    console.error("Error removing favorite:", err);
    return res.status(500).send({ error: "Remove Fav Error" });
  }
};