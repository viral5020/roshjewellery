// products-slice.js (Redux slice)
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  productDetails: null, // Ensure it's initialized properly
  // other properties
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProductDetails(state, action) {
      state.productDetails = action.payload;
    },
    // other reducers
  },
});

export const { setProductDetails } = productsSlice.actions;
export default productsSlice.reducer;
