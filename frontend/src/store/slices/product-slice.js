import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../redux-store.js';

// Fetch products with optional search query
export const fetchProductsByQuery = createAsyncThunk('product/fetchProductsByQuery', async (searchQuery = '', { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get('/products/', {
      params: { q: searchQuery }
    });
    return data || [];
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Fetch products by user ID
export const fetchProductsByUser = createAsyncThunk('product/fetchProductsByUser', async (user, { rejectWithValue }) => {
    try {
      console.log(user);
      const { data } = await axiosInstance.get('/products/', {
        params: { id: user.id }
      });
      return data || [];
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Create a new product
export const createProduct = createAsyncThunk('product/createProduct', async (productData, { dispatch, rejectWithValue }) => {
  try {
    console.log("Product Data:", productData);

    const response = await axiosInstance.post("/products/", productData);

    console.log("Product Created:", response.data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Edit an existing product
export const editProduct = createAsyncThunk('product/editProduct', async ({ productId, productData }, { rejectWithValue }) => {
    try {
      console.log(productId, productData);
      const data = await axiosInstance.put(`/products/${productId}/`,productData);
      console.log(data);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Delete a product
export const deleteProduct = createAsyncThunk('product/deleteProduct', async (productId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/products/${productId}/`);
      return productId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Buy a product
export const buyProduct = createAsyncThunk('product/buyProduct', async (productId, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post(`/buy/${productId.productId}/`);
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const productSlice = createSlice({
  name: 'product',
  initialState: {
    search_products: [],
    user_products: [],
    loading: false,
    error: null,
  },
  reducers: {
    setSearchedProducts(state, action){
      state.search_products = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProductsByQuery.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsByQuery.fulfilled, (state, action) => {
        state.search_products = action.payload;
        state.loading = false;
      })
      .addCase(fetchProductsByQuery.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.user_products.push(action.payload);
        state.loading = false;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // Buy Product
      .addCase(buyProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(buyProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.search_products = [];
      })
      .addCase(buyProduct.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      
      .addCase(fetchProductsByUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsByUser.fulfilled, (state, action) => {
        state.user_products = action.payload;
        state.loading = false;
      })
      .addCase(fetchProductsByUser.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })



      .addCase(editProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        const index = state.user_products.findIndex(
          p => p.id === action.payload.id
        );
        if (index !== -1) {
          state.user_products[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(editProduct.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })


      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.user_products = state.user_products.filter(
          p => p.id !== action.payload
        );
        state.loading = false;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export const { setSearchedProducts } = productSlice.actions;
export default productSlice.reducer;