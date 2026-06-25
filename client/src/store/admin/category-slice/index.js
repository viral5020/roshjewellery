// redux/categorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to fetch categories from the backend
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async () => {
    const response = await fetch('/api/categories');
    const data = await response.json();
    return data.categories;
  }
);

// Async thunk to create a new category
export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData) => {
    const formData = new FormData();
    formData.append('name', categoryData.name);
    formData.append('image', categoryData.image);

    const response = await fetch('/api/categories/create', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return data.category;
  }
);

// Category slice to manage categories state
const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    categories: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handling fetch categories action
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Handling create category action
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default categorySlice.reducer;
