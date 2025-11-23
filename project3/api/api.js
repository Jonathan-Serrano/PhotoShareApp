import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:3001",
})

// ------------ GET REQUESTS ------------
export const fetchUsers = async () => {
  try {
    const res = await api.get('/user/list');
    return res.data;
  } catch (err) {
    console.error('Error:', err);
  }
};

export const fetchUser = async (userId) => {
  try {
    const res = await api.get(`/user/${encodeURIComponent(userId)}`);
    return res.data;
  } catch (err) {
    console.error('Error:', err);
  }
};

export const fetchPhotos = async (userId) => {
  try {
    const res = await api.get(`/photosOfUser/${encodeURIComponent(userId)}`);
    return res.data;
  } catch (err) {
    console.error('Error:', err);
  }
};

export const fetchComments = async (userId) => {
  try {
    const res = await api.get(`/usersCommentDetails/${encodeURIComponent(userId)}`);
    return res.data;
  } catch (err) {
    console.error('Error:', err);
  }
};

export const fetchPhotoCounts = async () => {
  try {
    const res = await api.get('/usersPhotoCounts');
    return res.data;
  } catch (err) {
    console.error('Error:', err);
  }
}

export const fetchCommentCounts = async () => {
  try {
    const res = await api.get('/usersCommentCounts');
    return res.data;
  } catch (err) {
    console.error('Error:', err);
  }
}
