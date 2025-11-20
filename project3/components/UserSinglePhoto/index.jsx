import React, { useState, useEffect, useRef }  from 'react';
import { useNavigate, Link } from "react-router-dom";
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Pagination,
} from '@mui/material';
import { useQuery } from "@tanstack/react-query";

import './styles.css';
import { fetchPhotos } from '../../api/api.js';
import useAppStore from '../../store/useAppStore.js';

function UserSinglePhoto({ userId, index}) {

  // Access isChecked and setIsChecked from Zustand
  const isChecked = useAppStore((s) => s.isChecked);
  const setIsChecked = useAppStore((s) => s.setIsChecked);

  //  Set Navigation and flag for first run
  const navigate = useNavigate();
  const firstRun = useRef(true);

  // Fetch user photos
  const { data: photos = [], isLoading, error } = useQuery({
    queryKey: ["photos", userId],
    queryFn: () => fetchPhotos(userId),
  });

  const photo = photos?.[index - 1] || {};
  const photoLength = photos?.length || 0;

  // For Moving between pages
  const handlePageChange = (event, value) => {
    navigate(`/photos/${encodeURIComponent(userId)}/${value}`);
  };

  useEffect(() => {

    // Skip the effect on the first render
    if (firstRun.current) {
      firstRun.current = false;
      setIsChecked(true);
      return;
    }

    // Navigate to user photos 
    if (!isChecked) {
        navigate(`/photos/${encodeURIComponent(userId)}`);
    }
  }, [isChecked]);

  return (
      <>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, padding: 2, justifyContent: 'center' }}>
          <Card key={photo._id} sx={{ maxWidth: 500, marginBottom: 2 }}>
            <CardMedia
                component="img"
                height="400"
                image={`/images/${photo.file_name}`}
                alt={photo.file_name}
            />
            <CardContent>
              <Typography variant="body2" color="text.primary">
                <strong>Posted On:</strong> {new Date(photo.date_time).toLocaleString()}
              </Typography>
              <Typography variant="subtitle1" color="text.primary">
                Comments:
              </Typography>
              {photo.comments && photo.comments.length > 0 ? (
              photo.comments.map((comment) => (
                <Box key={comment._id} sx={{ marginBottom: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>
                      <Link 
                        className='user-link'
                        to={`/users/${comment.user._id}`}
                        style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        fontWeight: 'bold',
                        }}
                      >
                        {comment.user.first_name} {comment.user.last_name}:
                      </Link>
                      {' '}
                    </strong> 
                    {comment.comment}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(comment.date_time).toLocaleString()}
                  </Typography>
                </Box>
              ))
              ) : (
              <Typography variant="body2" color="text.secondary">
                No comments available.
              </Typography>
              )}
            </CardContent>
          </Card>            
        </Box>
        <Pagination sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, padding: 2, justifyContent: 'center' }} 
                    count={photoLength} shape="rounded" onChange={handlePageChange} page={parseInt(index, 10)} />
      </>
  );
}

UserSinglePhoto.propTypes = {
    userId: PropTypes.string.isRequired,
    index: PropTypes.string.isRequired,
};

export default UserSinglePhoto;
