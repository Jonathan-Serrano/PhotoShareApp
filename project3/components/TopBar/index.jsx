import React from 'react';
import { useLocation } from "react-router-dom";
import {
  FormGroup,
  FormControlLabel,
  Switch,
  AppBar,
  Toolbar,
  Typography,
} from '@mui/material';
import { useQuery } from "@tanstack/react-query";

import './styles.css';
import { fetchUser } from '../../api/api.js';
import useAppStore from '../../store/useAppStore.js';

function TopBar() {

  // Access isChecked and toggleChecked from Zustand
  const isChecked = useAppStore((s) => s.isChecked);
  const toggleChecked = useAppStore((s) => s.toggleChecked);

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
  });

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar sx={{justifyContent: 'space-between'}}>
        <Typography variant="h5" color="inherit" >
          Jonathan Serrano and Benjamin Ly
        </Typography>
        <FormGroup>
          <FormControlLabel 
            control={<Switch color="secondary" checked={isChecked} onChange={toggleChecked}/>} 
            label="Enable Advanced Features" 
          />
        </FormGroup>
        <Typography variant="h5" color="inherit">
          {parsedPath.includes("photos") && userId ? `Photos of ${userDetails.first_name} ${userDetails.last_name}` : ''}
          {!(parsedPath.includes("photos") || parsedPath.includes("comments")) && userId ? `${userDetails.first_name} ${userDetails.last_name}` : ''}
          {parsedPath.includes("comments") && userId ? `Comments of ${userDetails.first_name} ${userDetails.last_name}` : ''}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
