import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true,
});

export const fetchUsers = async () => {
  try {
    const res = await api.get('/user/list');
    return res.data;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
};

export const fetchUser = async (userId) => {
  try {
    const res = await api.get(`/user/${encodeURIComponent(userId)}`);
    return res.data;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
};

export const fetchPhotos = async (userId) => {
  try {
    const res = await api.get(`/photosOfUser/${encodeURIComponent(userId)}`);
    return res.data;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
};

export const fetchComments = async (userId) => {
  try {
    const res = await api.get(`/usersCommentDetails/${encodeURIComponent(userId)}`);
    return res.data;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
};

export const fetchMentions = async (userId) => {
  try {
    const res = await api.get(`/usersMentions/${encodeURIComponent(userId)}`);
    return res.data;
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
    throw err;
  }
};

export const fetchPhotoCounts = async () => {
  try {
    const res = await api.get('/usersPhotoCounts');
    return res.data;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
};

export const fetchCommentCounts = async () => {
  try {
    const res = await api.get('/usersCommentCounts');
    return res.data;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
};

export const loginToAccount = async (loginName, password) => {
  try {
    const res = await api.post('/admin/login', {
      login_name: loginName,
      password: password,
    });
    return res.data;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
};

export const getCurrentUser = async () => {
  try {
    const res = await api.get('/admin/currentUser');
    return res.data;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
};

export const logoutOfAccount = async () => {
  try {
    const res = await api.post('/admin/logout');
    return res.data;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
};

export const registerAccount = async (loginName, password, firstName, lastName, location, description, occupation) => {
  try {
    const res = await api.post('/user', {
      login_name: loginName,
      password: password,
      first_name: firstName,
      last_name: lastName,
      location: location,
      description: description,
      occupation: occupation,
    });
    return res.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Comments
export const addComment = async (photoId, comment, mentions = []) => {
  try {
    const res = await api.post(`/commentsOfPhoto/${photoId}`, { comment, mentions });
    return res.data;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
};

// Delete Comment
export const deleteComment = async (photoId, commentId) => {
  try {
    const res = await api.delete(`/commentDeletion/${photoId}/${commentId}`);
    return res.data;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
};

// Upload photo
export const uploadPhoto = async (file) => {
  try {
    const formData = new FormData();
    if (file) {
      formData.append('uploadedphoto', file);
    }

    const res = await api.post('/photos/new', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
};

export const fetchFavorites = async () => {
  try {
    const res = await api.get('/favoriteCheck');
    return res.data;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
};

export const addFavorite = async (photoId, DateTime) => {
  try {
    const res = await api.post('/favorite', { photo_id: photoId, date_time: DateTime });
    return res.data;
  } catch (err) {
    console.error('Error', err);
    throw err;
  }
};

export const removeFavorite = async (photoId) => {
  try {
    const res = await api.delete(`/favorite/${photoId}`);
    return res.data;
  } catch (err) {
    console.error('Error', err);
    throw err;
  }
};

// Delete Photo
export const deletePhoto = async (photoId) => {
  try {
    const res = await api.delete(`/PhotoDeletion/${photoId}`);
    return res.data;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
};

// Delete Account
export const deleteAccount = async (userId) => {
  try {
    const res = await api.delete(`/user/${userId}`);
    return res.data;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
};
