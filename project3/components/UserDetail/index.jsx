import React from 'react';
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';

import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
} from '@mui/material';
import { useQuery } from "@tanstack/react-query";

import './styles.css';
import { fetchUser } from '../../api/api.js';
import useAppStore from '../../store/useAppStore.js';

function UserDetail({ userId }) {

  // Access isChecked from Zustand
  const isChecked = useAppStore((s) => s.isChecked);

  // Set Navigation
  const navigate = useNavigate();

  // Fetch user details
  const { data: userDetails = {}, isLoading, error } = useQuery({
    queryKey: ["userDetails", userId],
    queryFn: () => fetchUser(userId),
  });

  // Navigate to user photos page
  const viewPhotos = () => {
    if (isChecked) {
      navigate(`/photos/${encodeURIComponent(userId)}/1`);
    } else {
      navigate(`/photos/${encodeURIComponent(userId)}`);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, padding: 2, justifyContent: 'center' }}>
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
    </Box>
  );
}

UserDetail.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default UserDetail;
