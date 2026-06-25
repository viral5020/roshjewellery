import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Grid, IconButton, Paper, Divider } from '@mui/material';
import { Add, Delete, CloudUpload } from '@mui/icons-material';
import axios from 'axios';

const InvoiceGeneratorPage = () => {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [logo, setLogo] = useState(null);
  const [items, setItems] = useState([{ description: '', quantity: 1, price: 0, amount: 0 }]);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [amountPaid, setAmountPaid] = useState(0);
  const [taxRate, setTaxRate] = useState(0);

  // Handle changes in the items list
  const handleItemChange = (index, event) => {
    const newItems = [...items];
    newItems[index][event.target.name] = event.target.value;
    setItems(newItems);

    // Recalculate amount if quantity or price is updated
    if (event.target.name === 'quantity' || event.target.name === 'price') {
      newItems[index].amount = newItems[index].quantity * newItems[index].price;
      setItems(newItems);
    }
  };

  // Add new item to the list
  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, price: 0, amount: 0 }]);
  };

  // Remove an item from the list
  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // Handle logo upload
  const handleLogoUpload = (e) => {
    setLogo(URL.createObjectURL(e.target.files[0]));
  };

  // Calculate the total values
  const calculateTotals = () => {
    const subtotal = items.reduce((acc, item) => acc + item.amount, 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;
    const balanceDue = totalAmount - amountPaid;

    return { subtotal, taxAmount, totalAmount, balanceDue };
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const subtotal = items.reduce((acc, item) => acc + item.amount, 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;
    const balanceDue = totalAmount - amountPaid;

    const invoiceData = {
      clientName,
      clientEmail,
      billingAddress,
      shippingAddress,
      invoiceNumber,
      invoiceDate,
      paymentMethod,
      dueDate,
      poNumber,
      logo,
      items,
      notes,
      terms,
      amountPaid,
      taxRate,
      subtotal,
      taxAmount,
      totalAmount,
      balanceDue
    };

    try {
      // Send the POST request to create the invoice
      const response = await axios.post('/api/admin/invoices', invoiceData);

      // Check if the response status is successful
      if (response.status === 201) {
        alert('Invoice created successfully!');
        console.log('Created Invoice:', response.data.invoice);  // Log the created invoice
      } else {
        alert('Error creating invoice!');
      }
    } catch (error) {
      alert('Error creating invoice!');
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    // Recalculate totals when items or payment changes
  }, [items, amountPaid, taxRate]);

  return (
    <Box sx={{ maxWidth: '1000px', margin: '0 auto', padding: 3 }}>
      <Paper sx={{ padding: 3 }}>
        {/* Invoice Header */}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              {/* Logo Upload Box */}
              <Box
                sx={{
                  border: '2px dashed #1976d2', // Dashed border for the box
                  padding: '20px',
                  textAlign: 'center',
                  minHeight: '150px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                  id="logo-upload"
                />
                <label htmlFor="logo-upload">
                  <IconButton component="span" color="primary">
                    <CloudUpload />
                  </IconButton>
                </label>
                <Typography variant="body2" sx={{ marginTop: 1 }}>
                  {logo ? "Logo Uploaded" : "Upload Logo"}
                </Typography>
                {logo && (
                  <img src={logo} alt="Logo" style={{ width: '100px', marginTop: '10px' }} />
                )}
              </Box>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <TextField
                label="Invoice Number"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                fullWidth
                variant="outlined"
                required
              />
            </Grid>
          </Grid>

          {/* Client Information */}
          <Grid container spacing={3} sx={{ marginTop: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Client Name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                fullWidth
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Client Email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                fullWidth
                variant="outlined"
                required
              />
            </Grid>
          </Grid>

          {/* Billing and Shipping Information */}
          <Grid container spacing={3} sx={{ marginTop: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Bill To</Typography>
              <TextField
                label="Billing Address"
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                fullWidth
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Ship To</Typography>
              <TextField
                label="Shipping Address"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                fullWidth
                variant="outlined"
                required
              />
            </Grid>
          </Grid>

          {/* Invoice Details */}
          <Grid container spacing={3} sx={{ marginTop: 2 }}>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Invoice Date"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                fullWidth
                variant="outlined"
                required
                InputLabelProps={{
                  shrink: true,  // Ensures that the label does not overlap
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Payment Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                fullWidth
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                fullWidth
                variant="outlined"
                required
                InputLabelProps={{
                  shrink: true,  // Ensures that the label does not overlap
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="PO Number"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                fullWidth
                variant="outlined"
                required
              />
            </Grid>
          </Grid>

          {/* Items List */}
          <Box sx={{ marginTop: 3 }}>
            <Typography variant="h6">Items</Typography>
            {items.map((item, index) => (
              <Box key={index} sx={{ marginBottom: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Item Description"
                      name="description"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, e)}
                      fullWidth
                      variant="outlined"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      label="Quantity"
                      name="quantity"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, e)}
                      fullWidth
                      variant="outlined"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      label="Price"
                      name="price"
                      type="number"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, e)}
                      fullWidth
                      variant="outlined"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      label="Amount"
                      value={item.amount}
                      fullWidth
                      variant="outlined"
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <IconButton color="error" onClick={() => handleRemoveItem(index)} sx={{ marginTop: 3 }}>
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Add />}
              onClick={handleAddItem}
            >
              Add Item
            </Button>
          </Box>

          {/* Notes and Terms */}
          <Grid container spacing={3} sx={{ marginTop: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Notes (Optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                variant="outlined"
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Terms (Optional)"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                fullWidth
                variant="outlined"
                multiline
                rows={4}
              />
            </Grid>
          </Grid>

          {/* Pricing Summary */}
          <Grid container spacing={3} sx={{ marginTop: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Subtotal</Typography>
              <TextField
                value={items.reduce((acc, item) => acc + item.amount, 0)}
                fullWidth
                variant="outlined"
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Tax Percentage</Typography>
              <TextField
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                fullWidth
                variant="outlined"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ marginTop: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Amount Paid</Typography>
              <TextField
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Balance Due</Typography>
              <TextField
                value={calculateTotals().balanceDue}
                fullWidth
                variant="outlined"
                disabled
              />
            </Grid>
          </Grid>

          {/* Submit Button */}
          <Box sx={{ marginTop: 3, textAlign: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: '#000',  // Set the background color to black
                color: '#fff',            // Set the text color to white
                '&:hover': {
                  backgroundColor: '#333',  // Set a slightly lighter shade for the hover effect
                },
              }}
            >
              Generate Invoice
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default InvoiceGeneratorPage;
