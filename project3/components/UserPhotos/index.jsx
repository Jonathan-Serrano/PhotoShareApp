import React, { useState, useEffect }  from 'react';
import { Link, useNavigate } from "react-router-dom";
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import axios from 'axios';
import './styles.css';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
} from '@mui/material';

function UserPhotos({ userId, isChecked}) {

  // Hook and for photos and navigation
  const [photos, setPhotos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user photos
    const fetchPhotos = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/photosOfUser/${encodeURIComponent(userId)}`);
        setPhotos(res.data || []);
      } catch (err) {
        console.error('Error:', err);
      }
    };
    fetchPhotos();
  }, []);


  useEffect(() => {
    // Navigate to first photo if advanced features is on
    if (photos.length > 0 && isChecked) {
      navigate(`/photos/${encodeURIComponent(userId)}/1`);
    }
  }, [isChecked]);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, padding: 2, justifyContent: 'center' }}>
      {photos.length > 0 && (photos.map((photo) => (
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
      )))}
    </Box>
  );
}

UserPhotos.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default UserPhotos;
