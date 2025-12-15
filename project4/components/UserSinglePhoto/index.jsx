import React, { useState, useEffect, useRef }  from 'react';
import { useNavigate, Link } from 'react-router-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Typography,
  Pagination,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import './styles.css';
import { fetchPhotos, addComment, fetchFavorites, addFavorite, removeFavorite  } from '../../api/api.js';
import useAppStore from '../../store/useAppStore.js';

function UserSinglePhoto({ userId, index}) {

  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');

  // Access isChecked and setIsChecked from Zustand
  const isChecked = useAppStore((s) => s.isChecked);
  const setIsChecked = useAppStore((s) => s.setIsChecked);

  //  Set Navigation and flag for first run
  const navigate = useNavigate();
  const firstRun = useRef(true);

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
      (f) => String(f.photo_id._id) === String(photo._id)
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
          old.filter((f) => String(f.photo_id._id) !== String(photoId))
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
      onSuccess: () => setCommentText(''),
    });
  };

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

  const addFavoriteMutation = useAddFavorite(queryClient);
  const removeFavoriteMutation = useRemoveFavorite(queryClient);

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
                value={commentText}
                onChange={(e) => {
                  setCommentText(e.target.value);
                }}
                disabled={useAddComment.isPending}
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAddComment(photo._id, commentText)}
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
