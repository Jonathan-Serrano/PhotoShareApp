import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Link,
  Alert
} from '@mui/material';
import { useMutation } from "@tanstack/react-query";


import './styles.css';
import { loginToAccount } from '../../api/api.js';
import useAppStore from '../../store/useAppStore.js';

function LoginRegister() {

  // Set Navigation
  const navigate = useNavigate();
  const setIsLoggedIn = useAppStore((s) => s.setIsLoggedIn);
  const setUserInfo = useAppStore((s) => s.setUserInfo);
  const [loginFailed, setLoginFailed] = useState(false);

  const login = useMutation({
    mutationFn: (loginName) => loginToAccount(loginName),
    onSuccess: (data) => {
      setLoginFailed(false)
      setUserInfo(data);
      setIsLoggedIn(true);
      navigate(`/users/${encodeURIComponent(data._id)}`);
    },
    onError: (err) => {
      console.error("Login failed:", err);
      setLoginFailed(true)
    }
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    login.mutate(data.get('loginName'))
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
              id="loginName"
              label="Login Name"
              name="loginName"
              // autoComplete="email"
              autoFocus
            />
            {/* <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            /> */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            {loginFailed ?  <Alert sx={{ mt: 1, mb: 1  }} severity="error">Please enter a valid user</Alert> : <></> }
            <Grid item>
              <Link href="#" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Box>
      </Container>
  );
}

export default LoginRegister;
