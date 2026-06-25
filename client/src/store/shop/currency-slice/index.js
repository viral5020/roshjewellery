import { createSlice } from '@reduxjs/toolkit';

// Define initial state for currency and exchange rates
const initialState = {
  currency: 'INR',  // default currency
  exchangeRates: {
    INR: 1, // Base currency
    USD: 0.012, // INR to USD (1 INR = 0.012 USD)
    EUR: 0.011, // INR to EUR
    GBP: 0.0095, // INR to GBP
    CAD: 0.016, // INR to CAD
    AUD: 0.018, // INR to AUD
    JPY: 1.65, // INR to JPY
    CHF: 0.011, // INR to CHF
    NZD: 0.020, // INR to NZD
  },
};

// Create slice
const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setCurrency: (state, action) => {
      state.currency = action.payload;  // Set the selected currency
    },
    setExchangeRates: (state, action) => {
      state.exchangeRates = action.payload; // Set exchange rates if needed
    },
  },
});

// Export actions
export const { setCurrency, setExchangeRates } = currencySlice.actions;

// Selectors
export const selectCurrency = (state) => state.currency.currency;
export const selectExchangeRates = (state) => state.currency.exchangeRates;

export default currencySlice.reducer;
