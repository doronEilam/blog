import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getCommentById } from "../api/services/commentService";
import {
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";

const CommentPage = () => {
  const { commentId } = useParams();
  const [comment, setComment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchComment = async (commentId) => {
    try {
      const response = await getCommentById(commentId);
      setComment(response.data);
    } catch (error) {
      console.error('Error fetching comment:', error);
    }
  };

  useEffect(() => {
    const fetchCommentData = async () => {
      setLoading(true);
      setError("");
      try {
        const commentData = await getCommentById(commentId);
        console.log("Fetched comment data:", commentData);
        setComment(commentData);
      } catch (err) {
        console.error("Error fetching comment:", err);
        setError(err.message || "Failed to load comment.");
      } finally {
        setLoading(false);
      }
    };

    fetchCommentData();
  }, [commentId]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!comment) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography variant="h6" color="error">
          Comment not found.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Comment Details</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          {comment.content}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Author: {comment.author_name || "Anonymous"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Created At: {new Date(comment.created_at).toLocaleString()}
        </Typography>
      </Paper>
    </Container>
  );
};

export default CommentPage;
