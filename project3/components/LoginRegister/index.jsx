import React from 'react';
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
} from '@mui/material';
import { useQuery } from "@tanstack/react-query";

import './styles.css';
import { fetchUsers, fetchPhotoCounts, fetchCommentCounts } from '../../api/api.js';
import useAppStore from '../../store/useAppStore.js';

function LoginRegister() {
  const handleSubmit = (event) => {
    // event.preventDefault();
    // const data = new FormData(event.currentTarget);
    // console.log({
    //   email: data.get('email'),
    //   password: data.get('password'),
    // });
    console.log("hi")
  };


  return (
      <Container align="center" maxWidth="xs" >
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
          </Box>
      </Container>
  );
}

export default LoginRegister;
