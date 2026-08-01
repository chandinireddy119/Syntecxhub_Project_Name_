import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios, { getErrorMessage } from '../../utils/axiosConfig';

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params = {}, thunkAPI) => {
    try {
      const { data } = await axios.get('/products', { params });
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  'products/fetchDetails',
  async (id, thunkAPI) => {
    try {
      const { data } = await axios.get(`/products/${id}`);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, thunkAPI) => {
    try {
      const { data } = await axios.get('/products/categories');
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchTopProducts = createAsyncThunk(
  'products/fetchTop',
  async (_, thunkAPI) => {
    try {
      const { data } = await axios.get('/products/top');
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createReview = createAsyncThunk(
  'products/createReview',
  async ({ productId, review }, thunkAPI) => {
    try {
      await axios.post(`/products/${productId}/reviews`, review);
      return true;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

// Admin thunks
export const createProduct = createAsyncThunk(
  'products/create',
  async (productData, thunkAPI) => {
    try {
      const { data } = await axios.post('/products', productData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateProductAdmin = createAsyncThunk(
  'products/update',
  async ({ id, productData }, thunkAPI) => {
    try {
      const { data } = await axios.put(`/products/${id}`, productData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteProductAdmin = createAsyncThunk(
  'products/delete',
  async (id, thunkAPI) => {
    try {
      await axios.delete(`/products/${id}`);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    page: 1,
    pages: 1,
    total: 0,
    categories: [],
    topProducts: [],
    productDetails: null,
    loading: false,
    detailsLoading: false,
    error: null,
    reviewSuccess: false,
    reviewError: null,
  },
  reducers: {
    clearProductDetails: (state) => {
      state.productDetails = null;
    },
    clearReviewState: (state) => {
      state.reviewSuccess = false;
      state.reviewError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.productDetails = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchTopProducts.fulfilled, (state, action) => {
        state.topProducts = action.payload;
      })
      .addCase(createReview.fulfilled, (state) => {
        state.reviewSuccess = true;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.reviewError = action.payload;
      })
      .addCase(deleteProductAdmin.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p._id !== action.payload);
      });
  },
});

export const { clearProductDetails, clearReviewState } = productSlice.actions;
export default productSlice.reducer;
