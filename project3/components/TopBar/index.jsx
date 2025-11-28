import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FormGroup,
  FormControlLabel,
  Switch,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LogoutIcon from '@mui/icons-material/Logout';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';

import './styles.css';
import { fetchUser, logoutOfAccount, uploadPhoto } from '../../api/api.js';
import useAppStore from '../../store/useAppStore.js';

function TopBar() {

  const queryClient = useQueryClient();

  // Access isChecked and toggleChecked from Zustand
  const navigate = useNavigate();
  const isChecked = useAppStore((s) => s.isChecked);
  const toggleChecked = useAppStore((s) => s.toggleChecked);
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);
  const setIsLoggedIn = useAppStore((s) => s.setIsLoggedIn);
  const setUserInfo = useAppStore((s) => s.setUserInfo);
  const userAccountInfo = useAppStore((s) => s.userInfo);

  // Get user ID
  const location = useLocation();
  const parsedPath = location.pathname.split('/');
  const userId = (parsedPath.includes('photos') && parsedPath.length < 4) || parsedPath.includes('users') || parsedPath.includes('comments')
    ? parsedPath[parsedPath.length - 1]
    : (parsedPath.length >= 4) ? parsedPath[parsedPath.length - 2] : null;

  // Fetch user details
  const { data: userDetails = {} } = useQuery({
    queryKey: ['userDetails', userId],
    queryFn: () => fetchUser(userId),
    enabled: isLoggedIn && !!userId,
  });

  const logout = useMutation({
    mutationFn: logoutOfAccount,
    onSuccess: () => {
      setUserInfo(null);
      setIsLoggedIn(false);
      navigate('/login');
    },
  });

  const useUploadPhoto = useMutation({
    mutationFn: uploadPhoto,
    onSuccess: () => {
      // Refresh the user's photos page
      queryClient.invalidateQueries({ queryKey: ['photos', userId] });
      queryClient.invalidateQueries({ queryKey: ['photoCounts'] });
    },
  });

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar sx={{ display: 'flex', alignItems: 'center' }}>
        {isLoggedIn ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h5" color="inherit" >
              Hi {userAccountInfo.first_name}
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={<Switch color="secondary" checked={isChecked} onChange={toggleChecked}/>}
                  label="Enable Advanced Features"
                />
              </FormGroup>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="file"
                id="upload-photo"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const selected = e.target.files[0];
                  if (selected) {
                    useUploadPhoto.mutate(selected);
                  }
                }}
              />
              <label htmlFor="upload-photo" style={{ display: 'inline-block', cursor: 'pointer' }}>
                <Button
                  component="span"
                  variant="outlined"
                  color="inherit"
                  startIcon={<AddPhotoAlternateOutlinedIcon />}
                >
                Add Photo
                </Button>
              </label>
              <Typography variant="h5" color="inherit">
                {parsedPath.includes('photos') && userId ? `Photos of ${userDetails.first_name} ${userDetails.last_name}` : ''}
                {!(parsedPath.includes('photos') || parsedPath.includes('comments')) && userId ? `${userDetails.first_name} ${userDetails.last_name}` : ''}
                {parsedPath.includes('comments') && userId ? `Comments of ${userDetails.first_name} ${userDetails.last_name}` : ''}
              </Typography>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={() => logout.mutate()}
              >
              Logout
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" color="inherit" >
              Please Login
            </Typography>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
