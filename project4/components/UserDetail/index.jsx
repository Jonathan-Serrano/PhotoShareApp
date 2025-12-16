import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';

import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import './styles.css';
import { fetchUser, fetchMentions } from '../../api/api.js';
import useAppStore from '../../store/useAppStore.js';

function UserDetail({ userId }) {

  // Access isChecked from Zustand
  const isChecked = useAppStore((s) => s.isChecked);

  // Set Navigation
  const navigate = useNavigate();

  // Fetch user details
  const { data: userDetails = {} } = useQuery({
    queryKey: ['userDetails', userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
  });

  // Fetch user mentions
  const { data: mentions = [] } = useQuery({
    queryKey: ['mentions', userId],
    queryFn: () => fetchMentions(userId),
    enabled: !!userId,
  });

  // Navigate to user photos page
  const viewPhotos = () => {
    if (isChecked) {
      navigate(`/photos/${encodeURIComponent(userId)}/1`);
    } else {
      navigate(`/photos/${encodeURIComponent(userId)}`);
    }
  };

  // Go to photo page on photo click
  const goToPhotoPage = (event, photo_user_id, photo_index) => {
    if (isChecked) {
      navigate(`/photos/${encodeURIComponent(photo_user_id)}/${encodeURIComponent(photo_index + 1)}`);
    } else {
      navigate(`/photos/${encodeURIComponent(photo_user_id)}`);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 2, justifyContent: 'center' }}>
      <Card sx= {{padding: 1}}>
        <CardContent>
          <Typography variant="h6" align="center">
            {`${userDetails.first_name} ${userDetails.last_name}`}
          </Typography>
          <Typography variant="body1">
            <strong>Occupation:</strong> {userDetails.occupation}
          </Typography>
          <Typography variant="body1">
            <strong>Location:</strong> {userDetails.location}
          </Typography>
          <Typography variant="body1">
            <strong>Description:</strong> {userDetails.description}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button variant="outlined" onClick={() => viewPhotos()}>View Photos</Button>
          </Box>
        </CardContent>
      </Card>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Photos where {userDetails.first_name} {userDetails.last_name} is mentioned
        </Typography>

        {mentions.length === 0 && (
          <Typography variant="body2">
            No @mentions found for this user.
          </Typography>
        )}

        {mentions.length > 0 && (
          <List>
            {mentions.map((photo, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar sx={{ width: 86, height: 86, mr: 2, cursor: 'pointer' }} variant="square" src={`/images/${photo.file_name}`}
                      onClick={(event) => goToPhotoPage(event, photo.user._id, photo.photo_index)}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={(
                      <Typography variant="body1">
                        Owner:{' '}
                        <Link to={`/users/${photo.user._id}`}>
                          {photo.user.first_name} {photo.user.last_name}
                        </Link>
                        <br />
                        {photo.comment}
                      </Typography>
                    )}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}

UserDetail.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default UserDetail;
