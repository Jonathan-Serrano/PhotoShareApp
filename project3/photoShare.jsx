import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import ReactDOM from 'react-dom/client';
import { Grid, Paper } from '@mui/material';
import {
  BrowserRouter, Route, Routes, useParams,
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

  const isChecked = useAppStore((s) => s.isChecked);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TopBar />
            </Grid>
            <div className="main-topbar-buffer"/>
            <Grid item sm={3}>
              <Paper className="main-grid-item" sx={{height: '88.5vh', overflowY: 'auto'}}>
                <UserList />
              </Paper>
            </Grid>
            <Grid item sm={9}>
              <Paper className="main-grid-item" sx={{height: '88.5vh', overflowY: 'auto'}}>
                <Routes>
                  <Route path="/" />
                  <Route path="/users/:userId" element={<UserDetailRoute />} />
                  <Route path="/photos/:userId/:index" element={<UserSinglePhotoRoute />} />
                  <Route path="/photos/:userId" element={<UserPhotosRoute />} />
                  <Route path="/comments/:userId" element={<UserCommentsRoute />} />
                  <Route path="/users" element={<UserList />} />
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
