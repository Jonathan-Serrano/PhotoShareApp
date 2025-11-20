import React from 'react';
import { useLocation } from "react-router-dom";
import {
  FormGroup,
  FormControlLabel,
  Switch,
  AppBar,
  Toolbar,
  Typography,
  Box
} from '@mui/material';
import { useQuery } from "@tanstack/react-query";
import LogoutIcon from '@mui/icons-material/Logout';

import './styles.css';
import { fetchUser } from '../../api/api.js';
import useAppStore from '../../store/useAppStore.js';

function TopBar() {

  // Access isChecked and toggleChecked from Zustand
  const isChecked = useAppStore((s) => s.isChecked);
  const toggleChecked = useAppStore((s) => s.toggleChecked);
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);

  // Get user ID
  const location = useLocation();
  const parsedPath = location.pathname.split('/');
  const userId = (parsedPath.includes("photos") && parsedPath.length < 4) || parsedPath.includes("users") || parsedPath.includes("comments")
                ? parsedPath[parsedPath.length - 1]
                : (parsedPath.length >= 4) ? parsedPath[parsedPath.length - 2] : null;

  // Fetch user details
  const { data: userDetails = {}, isLoading, error } = useQuery({
    queryKey: ["userDetails", userId],
    queryFn: () => fetchUser(userId),
    enabled: isLoggedIn,
  });

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar sx={{ display: 'flex', alignItems: 'center' }}>
      {isLoggedIn ? (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" color="inherit" >
              Hi 
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
            <Typography variant="h5" color="inherit">
              {parsedPath.includes("photos") && userId ? `Photos of ${userDetails.first_name} ${userDetails.last_name}` : ''}
              {!(parsedPath.includes("photos") || parsedPath.includes("comments")) && userId ? `${userDetails.first_name} ${userDetails.last_name}` : ''}
              {parsedPath.includes("comments") && userId ? `Comments of ${userDetails.first_name} ${userDetails.last_name}` : ''}
            </Typography>
            <LogoutIcon />
          </Box> 
        </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" color="inherit" >
              Please Login
            </Typography>
          </Box>
        )
      } 
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
