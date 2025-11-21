import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:3001",
  withCredentials: true  
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
    const res = await api.get(`/getUsersCommentDetails/${encodeURIComponent(userId)}`);
    return res.data;
  } catch (err) {
    console.error('Error:', err);
  }
};

export const fetchPhotoCounts = async () => {
  try {
    const res = await api.get('/getUsersPhotoCount');
    return res.data;
  } catch (err) {
    console.error('Error:', err);
  }
}

export const fetchCommentCounts = async () => {
  try {
    const res = await api.get('/getUsersCommentCount');
    return res.data;
  } catch (err) {
    console.error('Error:', err);
  }
}

export const loginToAccount = async (loginName) => {
  try {
    console.log(loginName)
     const res = await api.post('/admin/login', {
      login_name: loginName
    });
    return res.data;
  } catch (err) {
    console.error('Error:', err);
  }
}
