import React, { useEffect } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import ReactDOM from 'react-dom/client';
import { Grid, Paper } from '@mui/material';
import {
  BrowserRouter, Route, Routes, useParams, Navigate,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import './styles/main.css';
// Import mock setup - Remove this once you have implemented the actual API calls
// import './lib/mockSetup.js';
import TopBar from './components/TopBar';
import UserDetail from './components/UserDetail';
import UserList from './components/UserList';
import UserPhotos from './components/UserPhotos';
import UserSinglePhoto from './components/UserSinglePhoto';
import UserComments from './components/UserComments';
import useAppStore from './store/useAppStore.js';
import LoginRegister from './components/LoginRegister'

const queryClient = new QueryClient();

function UserDetailRoute() {
  const { userId } = useParams();
  return <UserDetail userId={userId} />;
}

function UserPhotosRoute() {
  const { userId } = useParams();
  return <UserPhotos userId={userId} />;
}

function UserSinglePhotoRoute() {
  const { userId, index } = useParams();
  return <UserSinglePhoto userId={userId} index={index} />;
}

function UserCommentsRoute() {
  const { userId } = useParams();
  return <UserComments userId={userId} />;
}

function PhotoShare() {

  const isLoggedIn = useAppStore((s) => s.isLoggedIn);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TopBar />
            </Grid>
            <div className="main-topbar-buffer"/>
            {isLoggedIn ? ( <Grid item sm={3}>
              <Paper className="main-grid-item" sx={{height: '88.5vh', overflowY: 'auto'}}>
                {<UserList />}
              </Paper>
            </Grid>) : (
              <></>
            )}
            <Grid item sm={isLoggedIn ? 9 : 12}>
              <Paper className="main-grid-item" sx={{height: '88.5vh', overflowY: 'auto'}}>
                <Routes>
                  <Route path="/" element={isLoggedIn ? <></> :  <Navigate to="/login" /> }/>
                  <Route path="/login" element={ <LoginRegister /> }/>
                  <Route path="/users/:userId" element={isLoggedIn ? <UserDetailRoute /> : <Navigate to="/login" />} />
                  <Route path="/photos/:userId/:index" element={isLoggedIn ? <UserSinglePhotoRoute /> :  <Navigate to="/login" />} />
                  <Route path="/photos/:userId" element={isLoggedIn ? <UserPhotosRoute /> :  <Navigate to="/login" />} />
                  <Route path="/comments/:userId" element={isLoggedIn ? <UserCommentsRoute /> :  <Navigate to="/login" />} />
                  <Route path="/users" element={isLoggedIn ? <UserList /> :  <Navigate to="/login" />} />
                </Routes>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('photoshareapp'));
root.render(<PhotoShare />);
