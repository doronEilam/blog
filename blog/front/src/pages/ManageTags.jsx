import React, { useState, useEffect, useCallback } from 'react';
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
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getTags, createTag, updateTag, deleteTag } from '../api/services/articlesService';

const ManageTags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTag, setCurrentTag] = useState({ id: null, name: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [dialogError, setDialogError] = useState('');

  const fetchTags = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const tagsData = await getTags();
      setTags(tagsData || []);
    } catch (err) {
      console.error("Failed to fetch tags:", err);
      setError(err.message || 'Failed to load tags.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleOpenDialog = (tag = null) => {
    setCurrentTag(tag ? { id: tag.id, name: tag.name } : { id: null, name: '' });
    setIsEditing(!!tag);
    setDialogError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentTag({ id: null, name: '' });
    setIsEditing(false);
    setDialogError('');
  };

  const handleDialogInputChange = (event) => {
    setCurrentTag({ ...currentTag, name: event.target.value });
  };

  const handleSaveTag = async () => {
    if (!currentTag.name.trim()) {
      setDialogError('Tag name cannot be empty.');
      return;
    }

    try {
      if (isEditing) {
        await updateTag(currentTag.id, { name: currentTag.name });
      } else {
        await createTag({ name: currentTag.name });
      }
      handleCloseDialog();
      fetchTags();
    } catch (err) {
      console.error("Failed to save tag:", err);
      setDialogError(err.message || 'Failed to save tag.');
    }
  };

  const handleDeleteTag = async (tagId) => {
    if (window.confirm(`Are you sure you want to delete tag ID ${tagId}?`)) {
      try {
        await deleteTag(tagId);
        fetchTags();
      } catch (err) {
        console.error(`Failed to delete tag ${tagId}:`, err);
        setError(err.message || `Failed to delete tag ${tagId}.`);
      }
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Tags
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpenDialog()}
        >
          Add New Tag
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="manage tags table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tags.length > 0 ? tags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell>{tag.id}</TableCell>
                <TableCell>{tag.name}</TableCell>
                <TableCell>{tag.slug}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit Tag">
                    <IconButton onClick={() => handleOpenDialog(tag)} size="small" color="primary">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Tag">
                    <IconButton onClick={() => handleDeleteTag(tag.id)} size="small" color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} align="center">No tags found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{isEditing ? 'Edit Tag' : 'Add New Tag'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {isEditing ? 'Update the name for this tag.' : 'Enter the name for the new tag.'}
          </DialogContentText>
          {dialogError && <Alert severity="error" sx={{ mt: 1 }}>{dialogError}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Tag Name"
            type="text"
            fullWidth
            variant="standard"
            value={currentTag.name}
            onChange={handleDialogInputChange}
            error={!!dialogError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveTag}>{isEditing ? 'Save Changes' : 'Add Tag'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageTags;
