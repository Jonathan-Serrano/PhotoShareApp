import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  Chip,
} from '@mui/material';

import './styles.css';

function UserList({ isChecked }) {

  // Set Navigation and hooks
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [photoCounts, setPhotoCounts] = useState({});
  const [commentCounts, setCommentCounts] = useState({});

  useEffect(() => {
    // Fetch user list
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:3001/user/list');
        setUsers(res.data || []);
      } catch (err) {
        console.error('Error:', err);
      }
    };
    fetchUsers();
  }, []);


  useEffect(() => {

    // Get Counts if the checkbox is checked and there are users
    if (users.length > 0 && isChecked) {
      // Fetch photo counts
      const fetchPhotoCounts= async () => {
        try {
          const res = await axios.get('http://localhost:3001/getUsersPhotoCount');
          setPhotoCounts(res.data || {});
        } catch (err) {
          console.error('Error:', err);
        }
      };
      fetchPhotoCounts();

      // Fetch comment counts
      const fetchCommentCounts = async () => {
        try {
          const res = await axios.get('http://localhost:3001/getUsersCommentCount');
          setCommentCounts(res.data || {});
        } catch (err) {
          console.error('Error:', err);
        }
      };
      fetchCommentCounts();
    }
  }, [isChecked, users]);

  // Navigate to user details page
  const goToUserDetailsPage = (userId) => {
    navigate(`/users/${encodeURIComponent(userId)}`);
  };

  // Navigate to user comments page
  const goToUserCommentsPage = (event, userId) => {
    event.stopPropagation(); // Prevent triggering parent onClick
    navigate(`/comments/${encodeURIComponent(userId)}`);
  };

  return (
    <div>
      {users.length === 0 ? (
        <Typography variant="body1">No users found.</Typography>
      ) : (
        <List component="nav">
          {users.map((u) => (
            <React.Fragment key={u._id}>
              <ListItem disablePadding>
                <ListItemButton onClick={() => goToUserDetailsPage(u._id)}>
                  <ListItemText primary={`${u.first_name} ${u.last_name}`.trim()} />
                </ListItemButton>
                  { isChecked && photoCounts[u._id] !== undefined && (
                    <Chip color="success" sx={{ marginLeft: 2 }} label={`${photoCounts[u._id]} ${photoCounts[u._id] === 1 ? 'photo' : 'photos'}`}/>
                  )}
                  { isChecked && commentCounts[u._id] !== undefined && (
                    <Chip onClick={(event) => goToUserCommentsPage(event, u._id)} color="error" sx={{ marginLeft: 2 }} label={`${commentCounts[u._id]} ${commentCounts[u._id] === 1 ? 'comment' : 'comments'}`}/>
                  )}
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      )}
    </div>
  );
}

export default UserList;
