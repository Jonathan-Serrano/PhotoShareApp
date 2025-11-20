import React, { useState } from 'react';
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

const queryClient = new QueryClient();

function UserDetailRoute({isChecked}) {
  const { userId } = useParams();
  return <UserDetail userId={userId} isChecked={isChecked}/>;
}

function UserPhotosRoute({isChecked}) {
  const { userId } = useParams();
  return <UserPhotos userId={userId} isChecked={isChecked}/>;
}

function UserSinglePhotoRoute({isChecked, setIsChecked}) {
  const { userId, index } = useParams();
  return <UserSinglePhoto userId={userId} index={index} isChecked={isChecked} setIsChecked={setIsChecked}/>;
}

function UserCommentsRoute({isChecked}) {
  const { userId } = useParams();
  return <UserComments userId={userId} isChecked={isChecked} />;
}

function PhotoShare() {

  const [isChecked, setIsChecked] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TopBar isChecked={isChecked} setIsChecked={setIsChecked} />
            </Grid>
            <div className="main-topbar-buffer"/>
            <Grid item sm={3}>
              <Paper className="main-grid-item" sx={{height: '88.5vh', overflowY: 'auto'}}>
                <UserList isChecked={isChecked} setIsChecked={setIsChecked}/>
              </Paper>
            </Grid>
            <Grid item sm={9}>
              <Paper className="main-grid-item" sx={{height: '88.5vh', overflowY: 'auto'}}>
                <Routes>
                  <Route path="/" />
                  <Route path="/users/:userId" element={<UserDetailRoute isChecked={isChecked} />} />
                  <Route path="/photos/:userId/:index" element={<UserSinglePhotoRoute isChecked={isChecked} setIsChecked={setIsChecked} />} />
                  <Route path="/photos/:userId" element={<UserPhotosRoute isChecked={isChecked} />} />
                  <Route path="/comments/:userId" element={<UserCommentsRoute isChecked={isChecked}/>} />
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
