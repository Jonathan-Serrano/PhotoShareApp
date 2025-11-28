import User from "../schema/user.js";
import Photo from "../schema/photo.js";
import SchemaInfo from "../schema/schemaInfo.js";

/**
 * /test/info - Returns the SchemaInfo object of the database in JSON format.
 *              This is good for testing connectivity with MongoDB.
 */
export const info = async (request, response) => {
  try {
    // Get SchemaInfo
    const testInfo = await SchemaInfo.find();
    return response.status(200).json(testInfo);
  }
  catch (err) {
    return response.status(400).json({ error: "Schema Info error" });
  }
};

/**
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
export const counts = async (request, response) => {

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
    return response.status(400).json({ error: "Counts error" });
  }
};
