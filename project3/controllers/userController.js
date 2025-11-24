import User from "../schema/user.js";

export const base = (request, response) => {
  response.send("Simple web server of files from " + __dirname);
};


/**
 * URL /user/list - Returns all the User objects.
 */
export const userList = async (request, response) => {

  try {
    // Find all users
    const users = await User.find().select('_id first_name last_name');
    return response.status(200).json(users);
  } catch (err) {
    return response.status(500).json({ error: 'User list error' });
  }
};

/**
 * URL /user/:id - Returns the information for User (id).
 */
export const userId = async (request, response) => {

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
};

/**
 * POST /user - Register new account.
 */
export const user = async (req, res) => {
  try {
    const { login_name, password, first_name, last_name, location, description, occupation } = req.body;
    const missingFields = [];
    
    if (!login_name || login_name.trim().length === 0) missingFields.push("Login Name");
    if (!password || password.trim().length === 0) missingFields.push("Password");
    if (!first_name || first_name.trim().length === 0) missingFields.push("First Name");
    if (!last_name || last_name.trim().length === 0) missingFields.push("Last Name");

    if (missingFields.length > 0) {
      return res.status(400).send(`Please fill in: ${missingFields.join(", ")}`);
    }

    const userAccount = await User.findOne({ login_name });
    if (userAccount) {
      return res.status(400).send('Login Name already exists');
    }

    const newUser = await User.create({
      login_name: login_name.trim(),
      password: password.trim(),
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      location: location ? location.trim() : '',
      description: description ? description.trim() : '',
      occupation: occupation ? occupation.trim() : '',
    });

    return res.status(200).send({
      _id: newUser._id,
      login_name: newUser.login_name,
    });

  } catch (err) {
    return res.status(500).send({ error: 'Server error' });
  }
};