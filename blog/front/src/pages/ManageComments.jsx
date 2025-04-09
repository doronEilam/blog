import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  CircularProgress, 
  Alert,
  IconButton,
  Tooltip,
  Link as MuiLink
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getAllComments, deleteComment } from '../api/services/commentService';
import { Link as RouterLink } from 'react-router-dom';

const ManageComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComments = async () => {
    setLoading(true);
    setError('');
    try {
      const commentsData = await getAllComments();
      setComments(commentsData || []);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
      setError(err.message || 'Failed to load comments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleDeleteComment = async (commentId) => {
    if (window.confirm(`Are you sure you want to delete comment ${commentId}? This action cannot be undone.`)) {
      try {
        await deleteComment(commentId);
        fetchComments();
        alert(`Comment ${commentId} deleted successfully.`);
      } catch (err) {
        console.error(`Failed to delete comment ${commentId}:`, err);
        alert(`Failed to delete comment: ${err.message || 'Unknown error'}`);
      }
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Comments
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="manage comments table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Content</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Article</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <TableRow key={comment.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell>{comment.id}</TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 300,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {comment.content}
                  </TableCell>
                  <TableCell>{comment.author_name || "Unknown"}</TableCell>
                  <TableCell>
                    {comment.article ? (
                      <MuiLink component={RouterLink} to={`/articles/${comment.article}`}>
                        Article {comment.article}
                      </MuiLink>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>{new Date(comment.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Tooltip title="View comment">
                      <IconButton
                        component={RouterLink}
                        to={`/${comment.id}`}
                        size="small"
                        color="primary"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Comment">
                      <IconButton
                        onClick={() => handleDeleteComment(comment.id)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No comments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ManageComments;
