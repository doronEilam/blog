import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getArticleById, getArticleComments } from '../../api/services/articlesService';
import { Container, Typography, Paper, Box, CircularProgress, Chip, Divider } from '@mui/material';

const ArticlePage = () => {
  const { articleId } = useParams();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticleData = async () => {
      try {
        const articleData = await getArticleById(articleId);
        const commentsData = await getArticleComments(articleId);
        setArticle(articleData);
        setComments(commentsData);
      } catch (error) {
        console.error('Error fetching article or comments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticleData();
  }, [articleId]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!article) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h6" color="error">
          Article not found.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {article.title}
        </Typography>
        {/* Display Author and Date */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          By {article.author_name || 'Unknown'} on {new Date(article.created_at).toLocaleDateString()}
        </Typography>
        {/* Display Tags */}
        {Array.isArray(article.tag_details) && article.tag_details.length > 0 && (
          <Box sx={{ my: 2 }}>
            {article.tag_details.map((tag) => (
              <Chip key={tag.id} label={tag.name} sx={{ mr: 0.5, mb: 0.5 }} />
            ))}
          </Box>
        )}
        <Divider sx={{ my: 2 }} /> 
        <Typography variant="body1" sx={{ mb: 3 }}>
          {article.content}
        </Typography>
        <Typography variant="h6" gutterBottom>
          Comments
        </Typography>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <Box key={comment.id} sx={{ mb: 2 }}>
              <Typography variant="subtitle2">{comment.author_name || 'Anonymous'}</Typography>
              <Typography variant="body2">{comment.content}</Typography>
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No comments yet.
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default ArticlePage;
