import User from "../schema/user.js";


// Login into account
export const login = async (request, response) => {
  try {

    const { login_name, password } = request.body;
    
    if ((!login_name || login_name.trim().length === 0) && (!password || password.trim().length === 0)) {
      return response.status(400).send("Please enter username and password");
    } else if (!login_name || login_name.trim().length === 0){
      return response.status(400).send("Please enter username");
    } else if (!password || password.trim().length === 0) {
      return response.status(400).send("Please enter password");
    } 

    const user = await User.findOne({ login_name: login_name, password: password });

    if (!user) {
      return response.status(400).send("Incorrect username or password");
    }

    request.session.user = {
      _id: user._id,
      first_name: user.first_name
    };

    return response.json(request.session.user);
    
  } catch (err) {
    return response.status(500).json({ error: 'login error' });
  }
};

// Get Account User
export const currentUser = async (request, response) => {
  try {
    if(!request.session || !request.session.user){
      return response.status(401).json({ error: 'No session found' });
    }
    const user = await User.findById(request.session.user._id).select('_id first_name');
    if (!user) {
      return response.status(400).json({ error: 'No user found' });
    }
    return response.status(200).json(user);
  } catch (err) {
    return response.status(500).json({ error: 'Server error' });
  }
};

// Logout Account
export const logout = async (request, response) => {
  try {
    if (!request.session.user) {
      return response.status(400).json({ error: "No user Logged in" });
    }

    return request.session.destroy(err => {
    if (err) {
      return response.status(500).json({ error: "Logout failed" });
    }

    response.clearCookie("connect.sid");

    return response.status(200).json({ message: "User logged out successfully" });
  });
  } catch (err) {
    return response.status(500).json({ error: 'Server error' });
  }
};