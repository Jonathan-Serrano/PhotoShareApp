import React, { useState, useEffect }  from 'react';
import { Link, useNavigate } from 'react-router-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import './styles.css';
import { fetchPhotos, addComment, deleteComment, deletePhoto } from '../../api/api.js';
import useAppStore from '../../store/useAppStore.js';

function UserPhotos({ userId }) {

  const queryClient = useQueryClient();
  const [commentTextById, setCommentTextById] = useState({});

  // Access from Zustand
  const isChecked = useAppStore((s) => s.isChecked);
  const userInfo = useAppStore((s) => s.userInfo);

  // Set Navigation
  const navigate = useNavigate();

  // Fetch user photos
  const { data: photos = [] } = useQuery({
    queryKey: ['photos', userId],
    queryFn: () => fetchPhotos(userId),
  });

  const useAddComment = useMutation({
    mutationFn: ({ photoId, comment }) => addComment(photoId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos', userId] });
      queryClient.invalidateQueries({ queryKey: ['commentCounts'] });
    },
  });

  const handleAddComment = (photoId, text) => {
    useAddComment.mutate({ photoId, comment: text }, {
      onSuccess: () => {
        setCommentTextById((prev) => ({ ...prev, [photoId]: '' }));
      },
    });
  };

  useEffect(() => {
    // Navigate to first photo if advanced features is on
    if (photos.length > 0 && isChecked) {
      navigate(`/photos/${encodeURIComponent(userId)}/1`);
    }
  }, [isChecked]);

  const useDeleteComment = useMutation({
    mutationFn: ({ photoId, commentId }) => deleteComment(photoId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos', userId] });
      queryClient.invalidateQueries({ queryKey: ['commentCounts'] });
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: (photoId) => deletePhoto(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos', userId] });
      queryClient.invalidateQueries({ queryKey: ['commentCounts'] });
      queryClient.invalidateQueries({ queryKey: ['photoCounts'] });
    },
  });

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
            {userInfo?._id === photo.user_id && (
            <Button color="error" onClick={() => deletePhotoMutation.mutate(photo._id)}>
              Delete Photo
            </Button>
            )}
            <Typography variant="subtitle1" color="text.primary">
              Comments:
            </Typography>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Type your comment here..."
                value={commentTextById[photo._id] || ''}
                onChange={(e) => {
                  setCommentTextById((prev) => ({
                    ...prev,
                    [photo._id]: e.target.value,
                  }));
                }}
                disabled={useAddComment.isPending}
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    handleAddComment(photo._id, commentTextById[photo._id] || '');
                  }}
                  disabled={useAddComment.isPending}
                  sx={{ textTransform: 'none' }}
                >
                  {useAddComment.isPending ? 'Adding...' : 'Add Comment'}
                </Button>
              </Box>
              <Divider sx={{ mt: 2 }} />
            </Box>

            {photo.comments && photo.comments.length > 0 ? (
              photo.comments.map((comment) => (
                <Box key={comment._id} sx={{ marginBottom: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>
                      <Link
                        className="user-link"
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
                  {userInfo._id === comment.user?._id && (
                  <Button color="error" size="small" sx={{ml: 2}} onClick={() => useDeleteComment.mutate({ photoId: photo._id, commentId: comment._id })}>
                    Delete Comment
                  </Button>)}
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
      {photos.length === 0 && (<Typography>Users has no photos</Typography>)}
    </Box>
  );
}

UserPhotos.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default UserPhotos;
