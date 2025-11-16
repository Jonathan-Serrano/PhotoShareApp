import React, { useState, useEffect }  from 'react';
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import axios from 'axios';
import './styles.css';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  Divider,
} from '@mui/material';


function UserComments({ userId, isChecked }) {

    // Navigation and hook for comment details
    const navigate = useNavigate();
    const [commentDeatils, setCommentDeatils] = useState([]);

    useEffect(() => {
        // Fetch user comment details
        const fetchComments = async () => {
          try {
            const res = await axios.get(`http://localhost:3001/getUsersCommentDetails/${encodeURIComponent(userId)}`);
            setCommentDeatils(res.data || []);
          } catch (err) {
            console.error('Error:', err);
          }
        };
        fetchComments();
    }, [userId]);

    // If advanced mode is not checked, navigate to user page
    useEffect(() => {
        if(!isChecked) {
            navigate(`/users/${encodeURIComponent(userId)}`); 
        }
    }, [isChecked]);

    // Go to photo page on comment or photo click
    const goToPhotoPage = (event, photo_user_id, photo_index) => {
        navigate(`/photos/${encodeURIComponent(photo_user_id)}/${encodeURIComponent(photo_index + 1)}`);
    };

    return ( 
        <List>
            {commentDeatils.map((comment, index) => (
                <React.Fragment key={index}>
                    <ListItemButton onClick={(event) => goToPhotoPage(event, comment.photo_user_id, comment.photo_index)}>
                        <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                                <Avatar sx={{ width: 86, height: 86, mr: 2}} variant="square" src={`/images/${comment.file_name}`} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={(
                                    
                                    <Typography variant="body1" component="span">
                                        {comment.comment}
                                    </Typography>
                                    
                                )}
                                secondary={(
                                    <Typography variant="body2" color="textSecondary">
                                    {new Date(comment.date_time).toLocaleString()}
                                    </Typography>
                                )}
                            />
                        </ListItem>
                    </ListItemButton>
                    <Divider />
                </React.Fragment>         
            ))}
        </List>
    );
}

UserComments.propTypes = {
    userId: PropTypes.string.isRequired,
};

export default UserComments;