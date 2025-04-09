import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  FormHelperText
} from '@mui/material';
import * as articleService from '../../api/services/articlesService';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const AddArticle = () => {
  const navigate = useNavigate();
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  
  // Data for dropdowns
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingFormData, setLoadingFormData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Load categories and tags when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingFormData(true);
        const [categoriesResponse, tagsResponse] = await Promise.all([
          articleService.getCategories(),
          articleService.getTags()
        ]);
        setCategories(categoriesResponse);
        setTags(tagsResponse);
      } catch (err) {
        console.error('Error loading form data:', err);
        setError('Failed to load categories and tags. Please try again.');
      } finally {
        setLoadingFormData(false);
      }
    };
    fetchData();
  }, []);
  
  const handleCategoryChange = (event) => {
    const { value } = event.target;
    setSelectedCategories(typeof value === 'string' ? value.split(',') : value);
  };
  
  const handleTagChange = (event) => {
    const { value } = event.target;
    setSelectedTags(typeof value === 'string' ? value.split(',') : value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content || selectedCategories.length === 0) {
      setError('Please fill in all required fields and select at least one category');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await articleService.createArticle(
        title, 
        content,
        selectedCategories, 
        selectedTags
      );
      setSuccess(true);
      setTimeout(() => navigate(`/articles/${response.id}`), 2000);
    } catch (err) {
      setError(err.message || 'Failed to create article. Please try again.');
      console.error('Error creating article:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Article
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            margin="normal"
          />
          
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="categories-label">Categories</InputLabel>
            <Select
              labelId="categories-label"
              id="categories"
              multiple
              value={selectedCategories}
              onChange={handleCategoryChange}
              input={<OutlinedInput id="select-multiple-chip" label="Categories" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((categoryId) => {
                    const category = categories.find(c => c.id === categoryId);
                    return category ? <Chip key={categoryId} label={category.name} /> : null;
                  })}
                </Box>
              )}
              MenuProps={MenuProps}
              disabled={loadingFormData}
            >
              {loadingFormData ? (
                <MenuItem disabled>Loading categories...</MenuItem>
              ) : (
                categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))
              )}
            </Select>
            <FormHelperText>Select one or more categories for your article</FormHelperText>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="tags-label">Tags</InputLabel>
            <Select
              labelId="tags-label"
              id="tags"
              multiple
              value={selectedTags}
              onChange={handleTagChange}
              input={<OutlinedInput id="select-multiple-chip" label="Tags" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((tagId) => {
                    const tag = tags.find(t => t.id === tagId);
                    return tag ? <Chip key={tagId} label={tag.name} /> : null;
                  })}
                </Box>
              )}
              MenuProps={MenuProps}
              disabled={loadingFormData}
            >
              {loadingFormData ? (
                <MenuItem disabled>Loading tags...</MenuItem>
              ) : (
                tags.map((tag) => (
                  <MenuItem key={tag.id} value={tag.id}>
                    {tag.name}
                  </MenuItem>
                ))
              )}
            </Select>
            <FormHelperText>Select one or more tags (optional)</FormHelperText>
          </FormControl>
          
          <TextField
            fullWidth
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            margin="normal"
            multiline
            rows={10}
          />
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading || loadingFormData}
            >
              {loading ? <CircularProgress size={24} /> : 'Publish Article'}
            </Button>
          </Box>
        </Box>
      </Paper>
      
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert 
          onClose={() => setSuccess(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Article created successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AddArticle;