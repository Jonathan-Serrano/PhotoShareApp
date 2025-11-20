import React from 'react';
import { useNavigate } from "react-router-dom";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  Chip,
} from '@mui/material';
import { useQuery } from "@tanstack/react-query";

import './styles.css';
import { fetchUsers, fetchPhotoCounts, fetchCommentCounts } from '../../api/api.js';

function UserList({ isChecked }) {

  // Set Navigation
  const navigate = useNavigate();

  // Fetch user list
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetchUsers(),
  });
  
  // Only fetch photo counts if users exist and checkbox is checked
  const shouldFetch = users.length > 0 && isChecked;

  // Fetch photo counts
  const { data: photoCounts = {}, isLoading: photoLoading } = useQuery({
    queryKey: ['photoCounts'],
    queryFn: fetchPhotoCounts,
    enabled: shouldFetch, 
  });

  // Fetch comment counts
  const { data: commentCounts = {}, isLoading: commentLoading } = useQuery({
    queryKey: ['commentCounts'],
    queryFn: fetchCommentCounts,
    enabled: shouldFetch,
  });

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
