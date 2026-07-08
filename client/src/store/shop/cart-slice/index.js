import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addToLocalCart, getLocalCart, removeFromLocalCart, updateLocalCartQuantity } from "./localCart";

const initialState = {
  cartItems: { items: [] },
  isLoading: false,
  tempCartItems: [], // Store items added before login
};

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ userId, productId, quantity, size }, { rejectWithValue, getState }) => {
    try {
      // If no userId, store in tempCartItems
      if (!userId) {
        // Fetch product details first
        const response = await axios.get(`/api/shop/products/get/${productId}`);
        const productDetails = response.data.data;
        
        const state = getState();
        const tempItems = [...state.shopCart.tempCartItems];
        const existingItem = tempItems.find(item => item.productId === productId && item.size === size);
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          tempItems.push({
            productId,
            quantity,
            title: productDetails.title,
            price: productDetails.price,
            salePrice: productDetails.salePrice,
            image: productDetails.image,
            weight: productDetails.weight,
            totalStock: productDetails.totalStock,
            size
          });
        }
        
        return { success: true, data: { items: tempItems } };
      }

      // If userId exists, use server
      const response = await axios.post(
        "/api/shop/cart/add",
        {
          userId,
          productId,
          quantity,
          size,
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (userId, { rejectWithValue, getState }) => {
    try {
      // If no userId, get from tempCartItems
      if (!userId) {
        const state = getState();
        return { success: true, data: { items: state.shopCart.tempCartItems } };
      }

      // If userId exists, fetch from server
      const response = await axios.get(
        `/api/shop/cart/get/${userId}`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async ({ userId, productId, size }, { rejectWithValue, getState }) => {
    try {
      // If no userId, remove from tempCartItems
      if (!userId) {
        const state = getState();
        const tempItems = state.shopCart.tempCartItems.filter(
          item => !(item.productId === productId && item.size === size)
        );
        return { success: true, data: { items: tempItems } };
      }

      // If userId exists, delete from server
      const response = await axios.delete(
        `/api/shop/cart/${userId}/${productId}${size ? `/${encodeURIComponent(size)}` : ''}`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async ({ userId, productId, quantity, size }, { rejectWithValue, getState }) => {
    try {
      // If no userId, update in tempCartItems
      if (!userId) {
        const state = getState();
        const tempItems = state.shopCart.tempCartItems.map(item => {
          if (item.productId === productId && item.size === size) {
            return { ...item, quantity };
          }
          return item;
        });
        return { success: true, data: { items: tempItems } };
      }

      // If userId exists, update on server
      const response = await axios.put(
        "/api/shop/cart/update-cart",
        {
          userId,
          productId,
          quantity,
          size,
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const mergeTempCartWithServer = createAsyncThunk(
  "cart/mergeTempCartWithServer",
  async (userId, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const tempItems = state.shopCart.tempCartItems;
      
      // If there's no temp cart, just fetch server cart
      if (!tempItems.length) {
        const response = await axios.get(
          `/api/shop/cart/get/${userId}`
        );
        return response.data;
      }

      // Merge temp cart items with server
      const mergePromises = tempItems.map(item => 
        axios.post("/api/shop/cart/add", {
          userId,
          productId: item.productId,
          quantity: item.quantity,
          size: item.size
        })
      );

      await Promise.all(mergePromises);
      
      // Fetch the updated cart from server
      const response = await axios.get(
        `/api/shop/cart/get/${userId}`
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const shoppingCartSlice = createSlice({
  name: "shoppingCart",
  initialState,
  reducers: {
    clearTempCart: (state) => {
      state.tempCartItems = [];
    },
    clearCart: (state) => {
      state.cartItems = { items: [] };
      state.tempCartItems = [];
      state.isLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!action.payload.data.userId) {
          state.tempCartItems = action.payload.data.items;
        } else {
          state.cartItems = action.payload.data;
        }
      })
      .addCase(addToCart.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(fetchCartItems.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(updateCartQuantity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(updateCartQuantity.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteCartItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(deleteCartItem.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(mergeTempCartWithServer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(mergeTempCartWithServer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
        state.tempCartItems = []; // Clear temp cart after successful merge
      })
      .addCase(mergeTempCartWithServer.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { clearTempCart, clearCart } = shoppingCartSlice.actions;
export default shoppingCartSlice.reducer;
