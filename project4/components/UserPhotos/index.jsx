import React, { useState, useEffect }  from 'react';
import { Link, useNavigate } from 'react-router-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Typography,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import './styles.css';
import { fetchPhotos, addComment, fetchFavorites, addFavorite, removeFavorite } from '../../api/api.js';
import useAppStore from '../../store/useAppStore.js';

function UserPhotos({ userId }) {

  const queryClient = useQueryClient();
  const [commentTextById, setCommentTextById] = useState({});

  // Access isChecked from Zustand
  const isChecked = useAppStore((s) => s.isChecked);

  // Set Navigation
  const navigate = useNavigate();

  // Fetch user photos
  const { data: photos = [] } = useQuery({
    queryKey: ['photos', userId],
    queryFn: () => fetchPhotos(userId),
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => fetchFavorites(),
  });

  const handleToggleFavorite = (photo) => {
    const DateTime = new Date(photo.date_time).toISOString();

    const isFavorite = favorites.some(
      (f) => String(f.photo_id._id) === String(photo._id),
    );

    if (isFavorite) {
      removeFavoriteMutation.mutate(photo._id);
    } else {
      addFavoriteMutation.mutate({ photoId: photo._id, DateTime });
    }
  };

  const useAddFavorite = (queryClient) => {

    return useMutation({
      mutationFn: ({ photoId, DateTime }) => addFavorite(photoId, DateTime),

      onMutate: async ({ photoId }) => {
        await queryClient.cancelQueries({ queryKey: ['favorites'] });

        const prev = queryClient.getQueryData(['favorites']);

        queryClient.setQueryData(['favorites'], (old = []) => [
          ...old,
          { photo_id: photoId },
        ]);

        return { prev };
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['favorites'] });
      },
    });
  };

  const useRemoveFavorite = (queryClient) => {

    return useMutation({
      mutationFn: (photoId) => removeFavorite(photoId),

      onMutate: async (photoId) => {
        await queryClient.cancelQueries({ queryKey: ['favorites'] });

        const prev = queryClient.getQueryData(['favorites']);

        queryClient.setQueryData(['favorites'], (old = []) =>
          old.filter((f) => String(f.photo_id._id) !== String(photoId)),
        );

        return { prev };
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['favorites'] });
      },
    });
  };



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

  const addFavoriteMutation = useAddFavorite(queryClient);
  const removeFavoriteMutation = useRemoveFavorite(queryClient);

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
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2" color="text.primary">
                  <strong>Posted On:</strong> {new Date(photo.date_time).toLocaleString()}
                </Typography>
                <Typography variant="subtitle1" color="text.primary">
                  Comments:
                </Typography>
              </Box>
              <IconButton onClick={() => handleToggleFavorite(photo)}>
                {favorites && favorites.some((f) => String(f.photo_id._id) === String(photo._id))
                  ? <FavoriteIcon color="error" />
                  : <FavoriteBorderIcon />}
              </IconButton>
            </Box>
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
