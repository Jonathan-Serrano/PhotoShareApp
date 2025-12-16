import React, { useState }  from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  Typography,
  List,
  Card,
  CardMedia,
  Modal,
  Box,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { fetchFavorites, removeFavorite } from '../../api/api.js';
import './styles.css';



function Favorites() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const handleOpen = (photo) => {
    setSelectedPhoto(photo);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPhoto(null);
  };

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => fetchFavorites(),
  });

  // Mutation to remove favorite
  const removeFavoriteMutation = useMutation({
    mutationFn: (photoId) => removeFavorite(photoId),
    onSuccess: () => queryClient.invalidateQueries(['favorites']),
  });

  const handleRemove = (favorite, e) => {
    e.stopPropagation(); // Prevent opening modal
    removeFavoriteMutation.mutate(favorite.photo_id._id);
  };


  return (
    <>
      <List sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, padding: 2, justifyContent: 'flex-start' }}>
        {favorites.length > 0 && (favorites.map((favorite) => (
          <Card key={favorite.photo_id._id} sx={{ maxWidth: 200, marginBottom: 2, position: 'relative' }} onClick={() => handleOpen(favorite)}>
            <IconButton onClick={(e) => handleRemove(favorite, e)} sx={{position: 'absolute', top: 4, right: 4, zIndex: 10, backgroundColor: 'white', '&:hover': { backgroundColor: 'white'}  }}>
              <CloseIcon fontSize="small" />
            </IconButton>

            <CardMedia
              component="img"
              height="200"
              image={`/images/${favorite.photo_id.file_name}`}
              alt={favorite.file_name}
            />
          </Card>
        )))}
      </List>

      <Modal
        open={open}
        onClose={handleClose}
      >
        <Box sx={{ marginBottom: 2, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', outline: 'none' }}>
          {selectedPhoto && selectedPhoto.photo_id &&  (
            <Card>
              <CardMedia
                component="img"
                image={`/images/${selectedPhoto.photo_id.file_name}`}
                alt={selectedPhoto.photo_id.file_name}
              />
              <Typography variant="h6" align="center" sx={{ mt: 2 }}>
                <strong>Posted On:</strong> {new Date(selectedPhoto.date_time).toLocaleString()}
              </Typography>
            </Card>
          )}
        </Box>
      </Modal>
    </>
  );
}

export default Favorites;