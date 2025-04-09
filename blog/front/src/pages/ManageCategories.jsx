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
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/services/articlesService'; 

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ id: null, name: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [dialogError, setDialogError] = useState('');

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError(err.message || 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenDialog = (category = null) => {
    if (category) {
      setCurrentCategory({ id: category.id, name: category.name, description: category.description || '' });
      setIsEditing(true);
    } else {
      setCurrentCategory({ id: null, name: '', description: '' });
      setIsEditing(false);
    }
    setDialogError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentCategory({ id: null, name: '', description: '' });
    setIsEditing(false);
    setDialogError('');
  };

  const handleDialogInputChange = (event) => {
    const { name, value } = event.target;
    setCurrentCategory({ ...currentCategory, [name]: value });
  };

  const handleSaveCategory = async () => {
    setDialogError('');
    if (!currentCategory.name.trim()) {
      setDialogError('Category name cannot be empty.');
      return;
    }

    const categoryData = { 
      name: currentCategory.name, 
      description: currentCategory.description 
    };

    try {
      if (isEditing) {
        await updateCategory(currentCategory.id, categoryData);
      } else {
        await createCategory(categoryData);
      }
      handleCloseDialog();
      fetchCategories();
    } catch (err) {
      console.error("Failed to save category:", err);
      setDialogError(err.message || 'Failed to save category.');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm(`Are you sure you want to delete category ID ${categoryId}? This might affect articles associated with it.`)) {
      try {
        await deleteCategory(categoryId);
        fetchCategories();
      } catch (err) {
        console.error(`Failed to delete category ${categoryId}:`, err);
        setError(err.message || `Failed to delete category ${categoryId}.`);
        alert(err.message || `Failed to delete category ${categoryId}.`);
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Categories
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpenDialog()}
        >
          Add New Category
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="manage categories table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.length > 0 ? categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.id}</TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description || 'N/A'}</TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit Category">
                    <IconButton onClick={() => handleOpenDialog(category)} size="small" color="primary">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Category">
                    <IconButton onClick={() => handleDeleteCategory(category.id)} size="small" color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} align="center">No categories found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{isEditing ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {isEditing ? 'Update the details for this category.' : 'Enter the details for the new category.'}
          </DialogContentText>
          {dialogError && <Alert severity="error" sx={{ mt: 1 }}>{dialogError}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            id="name"
            name="name"
            label="Category Name"
            type="text"
            fullWidth
            variant="standard"
            value={currentCategory.name}
            onChange={handleDialogInputChange}
            error={!!dialogError && !currentCategory.name.trim()}
            helperText={dialogError && !currentCategory.name.trim() ? "Name cannot be empty" : ""}
            required
          />
          <TextField
            margin="dense"
            id="description"
            name="description"
            label="Description (Optional)"
            type="text"
            fullWidth
            variant="standard"
            multiline
            rows={3}
            value={currentCategory.description}
            onChange={handleDialogInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveCategory}>{isEditing ? 'Save Changes' : 'Add Category'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageCategories;
