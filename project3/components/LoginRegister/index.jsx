import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Alert,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';


import './styles.css';
import { loginToAccount, registerAccount } from '../../api/api.js';
import useAppStore from '../../store/useAppStore.js';

function LoginRegister() {

  // Set Navigation and variables
  const navigate = useNavigate();
  const setIsLoggedIn = useAppStore((s) => s.setIsLoggedIn);
  const setUserInfo = useAppStore((s) => s.setUserInfo);
  const [loginFailed, setLoginFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [onLoginPage, setOnLoginPage] = useState(true);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const [loginName, setLoginName] = useState('');
  const [password, setPassword] = useState('');
  const [secondPassword, setSecondPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [location, setLocation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [description, setDescription] = useState('');

  const login = useMutation({
    mutationFn: () => loginToAccount(loginName, password),
    onSuccess: (data) => {
      setLoginFailed(false);
      setUserInfo(data);
      setIsLoggedIn(true);
      navigate(`/users/${encodeURIComponent(data._id)}`);
    },
    onError: (err) => {
      setErrorMessage(err.response.data);
      setLoginFailed(true);
    },
  });


  const register = useMutation({
    mutationFn: () => registerAccount(loginName, password, firstName, lastName, 
      location, description, occupation),
    onSuccess: () => {
      setLoginFailed(false);
      setRegisterSuccess(true);
      setLoginName('');
      setPassword('');
      setSecondPassword('');
      setFirstName('');
      setLastName('');
      setLocation('');
      setOccupation('');
      setDescription('');
    },
    onError: (err) => {
      setErrorMessage(err.response.data);
      setLoginFailed(true);
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    login.mutate({loginName, password});
  };

  const switchPages = () => {
    setOnLoginPage(!onLoginPage);
    setLoginFailed(false);
    setErrorMessage('');

    setLoginName('');
    setPassword('');
    setSecondPassword('');
    setFirstName('');
    setLastName('');
    setLocation('');
    setOccupation('');
    setDescription('');
  };

  const handleRegister = (event) => {
    event.preventDefault();

    // Check if passwords match
    if (password !== secondPassword) {
      setErrorMessage('Passwords do not match');
      setLoginFailed(true);
      return;
    }
    register.mutate({loginName, password, firstName, lastName, location, description, occupation});
  };

  return (
    onLoginPage ? 
      (
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
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            {loginFailed ?  <Alert sx={{ mt: 1, mb: 1  }} severity="error">{errorMessage}</Alert> : null }
          </Box>
          <Grid item>
            <Button variant="secondary" size="small" sx={{ textTransform: 'none' }} onClick={switchPages}>
              {"Don't have an account? Sign Up"}
            </Button>
          </Grid>
        </Container>
      )  : 
      (
        <Container align="center" maxWidth="xs" >
          <Typography component="h1" variant="h5">
          Register
          </Typography>
          <Box component="form" onSubmit={handleRegister} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="loginName"
              label="Login Name"
              name="loginName"
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="secondPassword"
              label="Confirm Password"
              type="password"
              id="secondPassword"
              autoComplete="current-password"
              value={secondPassword}
              onChange={(e) => setSecondPassword(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="firstName"
              label="First Name"
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="lastName"
              label="Last Name"
              name="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <TextField
              margin="normal"
              fullWidth
              id="location"
              label="Location"
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <TextField
              margin="normal"
              fullWidth
              id="occupation"
              label="Occupation"
              name="occupation"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
            />
            <TextField
              margin="normal"
              fullWidth
              id="description"
              label="Description"
              name="description"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Register Me
            </Button>
            {loginFailed ?  <Alert sx={{ mt: 1, mb: 1  }} severity="error">{errorMessage}</Alert> : null }
            {registerSuccess ? <Alert sx={{ mt: 1, mb: 1  }} severity="success"> Registered account successfuly </Alert> :null}
            <Grid item>
              <Button variant="secondary" size="small" sx={{ textTransform: 'none' }} onClick={switchPages}>
                {'Already have an account? Login'}
              </Button>
            </Grid>
          </Box>
        </Container>
      ));
}

export default LoginRegister;
