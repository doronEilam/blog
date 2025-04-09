import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getArticleById,
  updateArticle,
  getCategories,
  getTags,
} from "../../api/services/articlesService";
import {
  Select,
  TextField,
  Button,
  MenuItem,
  InputLabel,
  FormControl,
  OutlinedInput,
  Box,
  Chip,
} from "@mui/material";
import Swal from "sweetalert2";

const EditArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    authorName: "",
    selectedCategories: [],
    selectedTagIds: [],
    allCategories: [],
    allTags: [],
  });

  const [uiState, setUiState] = useState({
    loading: true,
    error: null,
    submitError: null,
    isSubmitting: false,
    isDirty: false,
  });

  const fetchArticleData = useCallback(async () => {
    setUiState((prev) => ({ ...prev, loading: true, error: "" }));
    try {
      const [articleResponse, categoriesResponse, tagsResponse] =
        await Promise.all([getArticleById(id), getCategories(), getTags()]);

      const article = articleResponse.data || articleResponse;
      const categoriesData =
        categoriesResponse.data?.results || categoriesResponse.data || [];
      const tagsData = tagsResponse?.results || tagsResponse || [];

      setFormData((prev) => ({
        ...prev,
        title: article.title,
        content: article.content,
        authorName: article.author_name || "Unknown",
        selectedCategories: article.category_details || [],
        selectedTagIds: (article.tag_details || []).map((tag) => Number(tag.id)),
        allCategories: categoriesData,
        allTags: tagsData,
      }));
    } catch (err) {
      setUiState((prev) => ({
        ...prev,
        error: err.message || "Failed to load required data.",
      }));
    } finally {
      setUiState((prev) => ({ ...prev, loading: false }));
    }
  }, [id]);

  useEffect(() => {
    fetchArticleData();
  }, [fetchArticleData]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (uiState.isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [uiState.isDirty]);

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    setUiState((prev) => ({ ...prev, isDirty: true }));
  };

  const validateForm = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      return "Title and Content cannot be empty.";
    }
    if (formData.selectedCategories.length === 0) {
      return "Please select at least one category.";
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setUiState((prev) => ({ ...prev, submitError: validationError }));
      return;
    }

    setUiState((prev) => ({ ...prev, isSubmitting: true, submitError: null }));

    try {
      await updateArticle(id, {
        title: formData.title.trim(),
        content: formData.content.trim(),
        categories: formData.selectedCategories.map((cat) => cat.id),
        tags: formData.selectedTagIds,
      });

      setUiState((prev) => ({ ...prev, isDirty: false }));
      Swal.fire({
        title: "Success!",
        text: "Article updated successfully!",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/");
      });
    } catch (err) {
      let errorMessage = "Failed to update article.";
      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
      console.error("Update error:", err);
    } finally {
      setUiState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleNavigateAway = () => {
    if (
      uiState.isDirty &&
      !window.confirm("You have unsaved changes. Are you sure you want to leave?")
    ) {
      return;
    }
    navigate("/");
  };

  if (uiState.loading) return <div>Loading article details...</div>;
  if (uiState.error)
    return <div style={{ color: "red", marginBottom: "15px" }}>{uiState.error}</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h2>Edit Article</h2>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          id="title"
          value={formData.title}
          onChange={handleInputChange("title")}
          required
          disabled={uiState.isSubmitting}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Content"
          id="content"
          multiline
          rows={10}
          value={formData.content}
          onChange={handleInputChange("content")}
          required
          disabled={uiState.isSubmitting}
          fullWidth
          sx={{ mb: 2 }}
        />
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="author" style={{ display: "block", marginBottom: "5px" }}>
            Author:
          </label>
          <input
            type="text"
            id="author"
            value={formData.authorName}
            readOnly
            style={{
              width: "calc(100% - 22px)",
              padding: "10px",
              marginBottom: "15px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              backgroundColor: "#f5f5f5",
              cursor: "not-allowed",
            }}
          />
        </div>
        {formData.allCategories.length > 0 ? (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="category-multiple-chip-label">Categories</InputLabel>
            <Select
              labelId="category-multiple-chip-label"
              id="category-multiple-chip"
              multiple
              value={formData.selectedCategories.map((cat) => cat.id)}
              onChange={(e) => {
                const selectedIds = e.target.value;
                const selectedObjects = formData.allCategories.filter((cat) =>
                  selectedIds.includes(cat.id)
                );
                setFormData((prev) => ({
                  ...prev,
                  selectedCategories: selectedObjects,
                }));
                setUiState((prev) => ({ ...prev, isDirty: true }));
              }}
              input={<OutlinedInput id="select-multiple-chip-category" label="Categories" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((id) => {
                    const category = formData.allCategories.find((c) => c.id === id);
                    return <Chip key={id} label={category?.name || id} />;
                  })}
                </Box>
              )}
              disabled={uiState.isSubmitting}
            >
              {formData.allCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <TextField
            label="Categories"
            value="Loading categories..."
            disabled
            fullWidth
            sx={{ mb: 2 }}
          />
        )}
        {uiState.loading ? (
          <TextField
            label="Tags"
            value="Loading..."
            disabled
            fullWidth
            sx={{ mb: 2 }}
          />
        ) : formData.allTags.length > 0 ? (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="tag-multiple-chip-label">Tags</InputLabel>
            <Select
              labelId="tag-multiple-chip-label"
              id="tag-multiple-chip"
              multiple
              value={formData.selectedTagIds}
              onChange={(e) => {
                const selectedIds = e.target.value.map((id) => Number(id));
                setFormData((prev) => ({
                  ...prev,
                  selectedTagIds: selectedIds,
                }));
                setUiState((prev) => ({ ...prev, isDirty: true }));
              }}
              input={<OutlinedInput id="select-multiple-chip-tag" label="Tags" />}
              renderValue={(selectedIds) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selectedIds.map((id) => {
                    const tag = formData.allTags.find((t) => t.id === id);
                    return <Chip key={id} label={tag?.name || `ID: ${id}`} />;
                  })}
                </Box>
              )}
              disabled={uiState.isSubmitting}
            >
              {formData.allTags.map((tag) => (
                <MenuItem key={tag.id} value={tag.id}>
                  {tag.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <TextField
            label="Tags"
            value="Loading tags..."
            disabled
            fullWidth
            sx={{ mb: 2 }}
          />
        )}
        <Button
          type="submit"
          variant="contained"
          sx={{
            opacity: uiState.isSubmitting ? 0.7 : 1,
            cursor: uiState.isSubmitting ? "not-allowed" : "pointer",
            mr: 1,
          }}
          disabled={uiState.isSubmitting}
        >
          {uiState.isSubmitting ? "Updating..." : "Update Article"}
        </Button>
        <Button
          type="button"
          variant="outlined"
          onClick={handleNavigateAway}
          disabled={uiState.isSubmitting}
        >
          Cancel
        </Button>
      </form>
    </div>
  );
};

export default EditArticle;
