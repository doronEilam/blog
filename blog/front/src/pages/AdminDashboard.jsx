import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Box,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import { Link } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import ArticleIcon from '@mui/icons-material/Article';
import CommentIcon from '@mui/icons-material/Comment';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, getSiteStats, getActivityLog } from '../api/services/adminService';
import { getAllArticles } from '../api/services/articlesService';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [statsData, usersData, logsData] = await Promise.all([
          getSiteStats(),
          getAllUsers(),
          getAllArticles(),
          getActivityLog(),
        ]);

        setStats({
          articles: statsData.total_articles || 0,
          users: statsData.total_users || 0,
          comments: statsData.total_comments || 0,
          pendingApproval: 0,
        });
        setUsers(usersData || []);
        setActivityLogs(logsData || []);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (!stats) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">Statistics data is unavailable.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Welcome, {currentUser?.username || 'Admin'}
        </Typography>
        <Typography variant="body1">
          This is your administration dashboard where you can manage all aspects of your blog.
        </Typography>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <ArticleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5">{stats.articles}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total Articles
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to="/admin/articles">
                Manage Articles
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <PeopleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5">{stats.users}</Typography>
              <Typography variant="body2" color="text.secondary">
                Registered Users
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to="/admin/users">
                Manage Users
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <CommentIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5">{stats.comments}</Typography>
              <Typography variant="body2" color="text.secondary">
                Comments
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to="/admin/comments">
                Manage Comments
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <LocalOfferIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5">{stats.pendingApproval}</Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Approval
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to="/admin/pending-approval">
                Review
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {activityLogs.length > 0 ? (
              activityLogs.map((log) => (
                <Box key={log.id} sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(log.timestamp).toLocaleString()} - {log.user_username || 'System'}
                  </Typography>
                  <Typography variant="body1">{log.action_display}: {log.details}</Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No recent activity found.
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Users ({users.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
              {users.map((user) => (
                <ListItem key={user.id}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.light' }}>
                      {user.username?.[0]?.toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={user.username} secondary={user.email} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
