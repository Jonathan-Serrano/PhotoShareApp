import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import axios from 'axios';
import './styles.css';
import {
  FormGroup,
  FormControlLabel,
  Switch,
  AppBar,
  Toolbar,
  Typography,
} from '@mui/material';

function TopBar({isChecked, setIsChecked}) {

  // Get user ID
  const location = useLocation();
  const parsedPath = location.pathname.split('/');
  const userID = (parsedPath.includes("photos") && parsedPath.length < 4) || parsedPath.includes("users") || parsedPath.includes("comments")
                ? parsedPath[parsedPath.length - 1]
                : (parsedPath.length >= 4) ? parsedPath[parsedPath.length - 2] : null;

  // Hook for user details
  const [UserDetails, setUserDetails] = useState([]);

  useEffect(() => {
    // Fetch user details
    if (userID) {
      const fetchUser = async () => {
        try {
          const res = await axios.get(`http://localhost:3001/user/${encodeURIComponent(userID)}`);
          setUserDetails(res.data || {});
        } catch (err) {
          console.error('Error:', err);
        }
      };
      fetchUser();
    }

  }, [userID]);

  // Advanced Features Toggle
  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar sx={{justifyContent: 'space-between'}}>
        <Typography variant="h5" color="inherit" >
          Jonathan Serrano
        </Typography>
        <FormGroup>
          <FormControlLabel 
            control={<Switch color="secondary" checked={isChecked} onChange={handleCheckboxChange}/>} 
            label="Enable Advanced Features" 
          />
        </FormGroup>
        <Typography variant="h5" color="inherit">
          {parsedPath.includes("photos") && userID ? `Photos of ${UserDetails.first_name} ${UserDetails.last_name}` : ''}
          {!(parsedPath.includes("photos") || parsedPath.includes("comments")) && userID ? `${UserDetails.first_name} ${UserDetails.last_name}` : ''}
          {parsedPath.includes("comments") && userID ? `Comments of ${UserDetails.first_name} ${UserDetails.last_name}` : ''}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
