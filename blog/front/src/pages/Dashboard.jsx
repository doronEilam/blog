import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Divider,
  Avatar,
  alpha,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getAllArticles, getApiEndpoints, deleteArticle } from '../api/services/articlesService';
import { useNavigate } from 'react-router-dom';
import { getArticleComments, createComment, deleteComment } from '../api/services/commentService';
import ReplyIcon from '@mui/icons-material/Reply';
import CloseIcon from '@mui/icons-material/Close';
import Swal from 'sweetalert2';

const StatsCard = styled(Paper)(({ theme, color }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '6px',
    height: '100%',
    backgroundColor: color,
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(1, 0),
  padding: theme.spacing(1, 3),
  boxShadow: 'none',
  '&:hover': {
    boxShadow: theme.shadows[2],
  }
}));

const StatsIconWrapper = styled(Box)(({ theme, color }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 48,
  height: 48,
  borderRadius: '50%',
  backgroundColor: alpha(color, 0.1),
  marginBottom: theme.spacing(2),
}));

const ArticleCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  }
}));

function Dashboard() {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    editors: 0,
    users: 0,
    admins: 0,
    recentActivities: []
  });
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllArticles, setShowAllArticles] = useState(false);
  const [openArticleDialog, setOpenArticleDialog] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleComments, setArticleComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentDeleted, setCommentDeleted] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [articleDeleting, setArticleDeleting] = useState(null); // State for loading indicator

  // Format date in local format
  const formatDate = (date) => {
    if (!date) return 'Unknown date';
    const parsedDate = new Date(date);
    return isNaN(parsedDate) ? 'Invalid date' : parsedDate.toLocaleDateString();
  };

  // Simulate fetching data from server
  useEffect(() => {
    const fetchData = async () => {
      try {
        const articlesData = await getAllArticles();
        setArticles(articlesData);
        setFilteredArticles(articlesData);
      } catch (error) {
        console.error("Error loading articles:", error);
      }
    };

    fetchData();
  }, []);

  // Filter articles based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredArticles(articles);
    } else {
      const searchTermLower = searchTerm.toLowerCase();
      const filtered = articles.filter(article => {
        const titleMatch = article.title?.toLowerCase().includes(searchTermLower);
        const contentMatch = article.content?.toLowerCase().includes(searchTermLower);
        // Use author_name which is provided by the serializer
        const authorMatch = article.author_name?.toLowerCase().includes(searchTermLower);
        // Check if any category name matches
        const categoryMatch = article.category_details?.some(cat => cat.name?.toLowerCase().includes(searchTermLower));
        // Check if any tag name matches
        const tagMatch = article.tag_details?.some(tag => tag.name?.toLowerCase().includes(searchTermLower));
        return titleMatch || contentMatch || authorMatch || categoryMatch || tagMatch;
      });
      setFilteredArticles(filtered);
    }
  }, [searchTerm, articles]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleShowAllArticles = () => {
    setShowAllArticles(true);
  };

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
    setOpenArticleDialog(true);
    fetchArticleComments(article.id);
  };
  const fetchArticleComments = async (articleId) => {
    try {
      const commentsData = await getArticleComments(articleId);
      setArticleComments(commentsData);
    } catch (error) {
      console.error("Error fetching article comments:", error);
    }
  };

  const handleCloseArticleDialog = () => {
    setOpenArticleDialog(false);
  };

const handleCommentSubmit = async (event) => {
  event.preventDefault();

  if (!newComment.trim() || !currentUser || !selectedArticle) {
    return;
  }

  setCommentSubmitting(true);

  try {
    const commentData = {
      content: newComment,
      article: selectedArticle.id // ודא שהשדה article נשלח
    };

    const createdComment = await createComment(commentData);

    // עדכון רשימת התגובות המקומית
    setArticleComments([...articleComments, createdComment]);
    setNewComment('');
  } catch (error) {
    console.error("Error creating comment:", error);
  } finally {
    setCommentSubmitting(false);
  }
};

const handleDeleteComment = async (commentId) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    // Show loading indicator
    setCommentDeleted(true);
    
    // Find the comment to get its author information
    const commentToDelete = findCommentById(commentId, articleComments);
   
    // Send delete request
    await deleteComment(commentId);
    
    // Update local state to reflect deletion
    const updatedComments = articleComments.filter(comment => {
      // Remove the comment if it matches the ID
      if (comment.id === commentId) return false;
      
      // If this comment has replies, filter out any reply that matches the ID
      if (comment.replies && comment.replies.length > 0) {
        comment.replies = comment.replies.filter(reply => reply.id !== commentId);
      }
      
      return true;
    });
    
    setArticleComments(updatedComments);
    // Show success message with Swal
    Swal.fire(
      'Deleted!',
      'The comment has been deleted.',
      'success'
    );
  } catch (error) {
    console.error("Error deleting comment:", error);
    // Show error message with Swal
    Swal.fire(
      'Error!',
      error.message || "Could not delete the comment.",
      'error'
    );
  } finally {
    setCommentDeleted(false);
  }
};

// Helper function to find a comment by ID in the nested structure
const findCommentById = (id, comments) => {
  // Convert ID to number to ensure proper comparison
  const numId = Number(id);
  
  for (const comment of comments) {
    if (Number(comment.id) === numId) {
      return comment;
    }
    
    if (comment.replies && comment.replies.length > 0) {
      const found = findCommentById(numId, comment.replies);
      if (found) return found;
    }
  }
  
  return null;
};

  const handleStartReply = (commentId) => {
    setReplyingTo(commentId);
    setReplyContent('');
  };
  const handleCancelReply = () => {
    setReplyingTo(null);
  };
const handleReplySubmit = async (event, parentId) => {
  event.preventDefault();

  if (!replyContent.trim() || !currentUser || !replyingTo) {
    return;
  }

  try {
    setCommentSubmitting(true);

    const replyData = {
      content: replyContent,
      parent: replyingTo,
      article: selectedArticle.id, // ודא שהשדה article נשלח
    };

    const response = await fetch(`/api/comments/${replyingTo}/add_reply/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(replyData),
    });

    if (!response.ok) {
      const errorData = await response.text(); // קרא את התגובה כטקסט כדי לבדוק אם מדובר ב-HTML
      console.error("Server response:", errorData); // הדפס את התגובה מהשרת
      throw new Error("Failed to post reply");
    }

    const createdReply = await response.json();

    // רענון התגובות
    if (selectedArticle) {
      fetchArticleComments(selectedArticle.id);
    }

    setReplyingTo(null);
    setReplyContent('');
  } catch (error) {
    console.error("Error posting reply:", error);
    alert("Failed to post reply. Please try again.");
  } finally {
    setCommentSubmitting(false);
  }
};

const handleDeleteArticle = async (articleId) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this article!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  });

  if (!result.isConfirmed) return;

  setArticleDeleting(articleId);
  try {
    await deleteArticle(articleId);
    setArticles(prevArticles => prevArticles.filter(article => article.id !== articleId));
    Swal.fire('Deleted!', 'The article has been deleted.', 'success');
  } catch (error) {
    console.error(`Error deleting article ${articleId}:`, error);
    Swal.fire('Error!', `Failed to delete article: ${error.message || 'Please try again.'}`, 'error');
  } finally {
    setArticleDeleting(null);
  }
};

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {currentUser?.username || 'User'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {new Date().toLocaleDateString()}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
      
        {/* Recent Articles */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h2">
                Recent Articles
              </Typography>
              
              <TextField
                placeholder="Search articles..."
                size="small"
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{ width: { xs: '100%', sm: '250px' } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            
            <Grid container spacing={3}>
  {(showAllArticles ? filteredArticles : filteredArticles.slice(0, 3)).map((article) => (
    <Grid item xs={12} sm={6} md={4} key={article.id}>
      <ArticleCard>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="div">
            {article.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {formatDate(article.created_at)}
          </Typography>
          <Typography variant="body2" paragraph>
            {article.content_preview ||
              (article.content
                ? article.content.length > 120
                  ? `${article.content.substring(0, 120)}...`
                  : article.content
                : 'No content available')}
          </Typography>
          {/* קטגוריות ותגים */}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Categories: {article.category_details?.map((cat) => cat.name).join(', ') || 'No categories'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Tags: {article.tag_details?.map((tag) => tag.name).join(', ') || 'No tags'}
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: 'space-between' }}>
          <Button
            size="small"
            onClick={() => handleArticleClick(article)}
            endIcon={<ArrowForwardIcon />}
          >
            Read More
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
  {currentUser && currentUser.user_id === article.author && (
    <>
      <IconButton
        size="small"
        onClick={() => navigate(`/editor/articles/edit/${article.id}`)}
        title="Edit Article"
        sx={{ mr: 1 }}
      >
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        onClick={() => handleDeleteArticle(article.id)}
        title="Delete Article"
        disabled={articleDeleting === article.id}
      >
        {articleDeleting === article.id ? <CircularProgress size={16} /> : <DeleteIcon fontSize="small" />}
      </IconButton>
    </>
  )}
  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
    By: {article.author_name || 'Unknown'}
  </Typography>
</Box>
</CardActions>
</ArticleCard>
</Grid>
))}
</Grid>
            
            {!showAllArticles && filteredArticles.length > 3 && (
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button 
                  variant="outlined" 
                  onClick={handleShowAllArticles}
                  endIcon={<MoreHorizIcon />}
                >
                  Show More Articles ({filteredArticles.length - 3})
                </Button>
              </Box>
            )}
            
            {filteredArticles.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No articles found matching your search
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
 
      </Grid>

      {/* Article Dialog */}
      <Dialog 
        open={openArticleDialog} 
        onClose={handleCloseArticleDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedArticle && (
          <>
            <DialogTitle>{selectedArticle.title}</DialogTitle>
            <DialogContent dividers>
              {/* Display Author, Date, Categories */}
              <Box sx={{ mb: 1 }}> 
                <Typography variant="subtitle2" color="text.secondary">
                  By: {selectedArticle.author_name || 'Unknown'} | {formatDate(selectedArticle.created_at)}
                </Typography>
                       <Divider sx={{ my: 2 }} /> 
                <Typography variant="caption" color="text.secondary" display="block">
                  Categories: {selectedArticle.category_details?.map(cat => cat.name).join(', ') || 'None'}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                Tags: {selectedArticle.tag_details?.map(tag => tag.name).join(', ') || 'None'}
              </Typography>
              </Box>
  
              <Divider sx={{ my: 2 }} /> 
              <Typography paragraph>
                {selectedArticle.content}
              </Typography>

              <Box sx={{ mt: 4 }}>
                <Divider sx={{ mb: 3 }}>
                  <Typography variant="h6" component="span">
                    Comments
                  </Typography>
                </Divider>
       
                <Box sx={{ mb: 3 }}>
                  {articleComments.length > 0 ? (
                    articleComments.map((comment) => (
                      <React.Fragment key={comment.id}>
                        <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              {comment.author_name ? comment.author_name.charAt(0) : 'U'}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle2" component="div">
                                {comment.author_name || 'Anonymous'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(comment.created_at)}
                              </Typography>
                            </Box>
                            <Box>
                              {currentUser && (
                                <IconButton size="small" onClick={() => handleStartReply(comment.id)} title="Reply">
                                  <ReplyIcon fontSize="small" />
                                </IconButton>
                              )}
                              {(currentUser?.username === comment.author_name || 
                                currentUser?.username === selectedArticle.author || 
                                currentUser?.is_admin) && (
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleDeleteComment(comment.id)} 
                                  title="Delete"
                                  disabled={commentDeleted}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          </Box>
                          
                          {/* תוכן התגובה */}
                          <Typography variant="body2" sx={{ pl: 7 }}>
                            {comment.content}
                          </Typography>
                          
                          {/* טופס תשובה לתגובה */}
                          {replyingTo === comment.id && (
                            <Box sx={{ mt: 2, ml: 7, p: 2, bgcolor: alpha('#f5f5f5', 0.5), borderRadius: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                  Replying to {comment.author_name}
                                </Typography>
                                <IconButton size="small" onClick={handleCancelReply}>
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Box>
                              <Box component="form" onSubmit={(e) => handleReplySubmit(e, comment.id)}>
                                <TextField
                                  id={`reply-to-${comment.id}`}
                                  fullWidth
                                  multiline
                                  rows={2}
                                  placeholder="Write your reply..."
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  variant="outlined"
                                  size="small"
                                  sx={{ mb: 1 }}
                                />
                                <Button 
                                  type="submit" 
                                  variant="contained" 
                                  size="small"
                                  disabled={!replyContent.trim() || commentSubmitting}
                                  endIcon={commentSubmitting ? <CircularProgress size={14} /> : <SendIcon />}
                                >
                                  Reply
                                </Button>
                              </Box>
                            </Box>
                          )}
                          
                          {/* תגובות משנה */}
                          {comment.replies && comment.replies.length > 0 && (
                            <Box sx={{ mt: 2, ml: 7 }}>
                              {comment.replies.map(reply => (
                                <Paper key={reply.id} sx={{ p: 2, mb: 1, bgcolor: alpha('#f5f5f5', 0.6) }}>
                                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                                    <Avatar sx={{ mr: 2, bgcolor: 'secondary.main', width: 28, height: 28 }}>
                                      {reply.author_name ? reply.author_name.charAt(0) : 'U'}
                                    </Avatar>
                                    <Box sx={{ flexGrow: 1 }}>
                                      <Typography variant="subtitle2" component="div" fontSize="0.9rem">
                                        {reply.author_name || 'Anonymous'}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {formatDate(reply.created_at)}
                                      </Typography>
                                    </Box>
                                    {(currentUser?.username === reply.author_name || 
                                      currentUser?.username === selectedArticle.author || 
                                      currentUser?.is_admin) && (
                                      <IconButton 
                                        size="small" 
                                        onClick={() => handleDeleteComment(reply.id)}
                                        disabled={commentDeleted}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    )}
                                  </Box>
                                  <Typography variant="body2" sx={{ pl: 5 }}>
                                    {reply.content}
                                  </Typography>
                                </Paper>
                              ))}
                            </Box>
                          )}
                        </Paper>
                      </React.Fragment>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center">
                      No comments yet. Be the first to share your thoughts!
                    </Typography>
                  )}
                </Box>
                
                {/* טופס תגובה למאמר - ללא שינוי */}
                {currentUser ? (
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      Add a Comment
                    </Typography>
                    <Box component="form" onSubmit={handleCommentSubmit}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Write your comment here..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        variant="outlined"
                        sx={{ mb: 2 }}
                      />
                      <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={!newComment.trim() || commentSubmitting}
                        endIcon={commentSubmitting ? <CircularProgress size={16} /> : <SendIcon />}
                      >
                        Post Comment
                      </Button>
                    </Box>
                  </Paper>
                ) : (
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Please login to add a comment
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      sx={{ mt: 1 }}
                      onClick={() => navigate('/login')}
                    >
                      Login
                    </Button>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseArticleDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}

export default Dashboard;
