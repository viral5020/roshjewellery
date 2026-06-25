import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  goldPrice: 0,
  silverPrice: 0,
  goldPrices: {},
  silverPrices: {},
  diamondPricePerCarat: 0,
  updatedCount: 0,
  lastUpdated: null,
};

export const fetchMetalPrices = createAsyncThunk(
  "metalPrice/fetch",
  async () => {
    const response = await axios.get("/api/admin/metal-prices/get");
    return response.data;
  }
);

export const setMetalPrices = createAsyncThunk(
  "metalPrice/set",
  async ({ goldPrice, silverPrice, goldPrices, silverPrices, diamondPricePerCarat }) => {
    const response = await axios.post("/api/admin/metal-prices/set", {
      goldPrice,
      silverPrice,
      goldPrices,
      silverPrices,
      diamondPricePerCarat,
    });
    return response.data;
  }
);

const metalPriceSlice = createSlice({
  name: "metalPrice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMetalPrices.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMetalPrices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.goldPrice = action.payload.data?.goldPrice || 0;
        state.silverPrice = action.payload.data?.silverPrice || 0;
        state.goldPrices = action.payload.data?.goldPrices || {};
        state.silverPrices = action.payload.data?.silverPrices || {};
        state.diamondPricePerCarat = action.payload.data?.diamondPricePerCarat || 0;
        state.lastUpdated = action.payload.data?.updatedAt || null;
      })
      .addCase(fetchMetalPrices.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(setMetalPrices.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(setMetalPrices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.goldPrice = action.payload.data?.goldPrice || 0;
        state.silverPrice = action.payload.data?.silverPrice || 0;
        state.goldPrices = action.payload.data?.goldPrices || {};
        state.silverPrices = action.payload.data?.silverPrices || {};
        state.diamondPricePerCarat = action.payload.data?.diamondPricePerCarat || 0;
        state.updatedCount = action.payload.updatedCount || 0;
        state.lastUpdated = action.payload.data?.updatedAt || null;
      })
      .addCase(setMetalPrices.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default metalPriceSlice.reducer;
