import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Avatar, TextField, Checkbox } from '@mui/material';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllProducts } from '@/store/admin/products-slice';

const InventoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editedProducts, setEditedProducts] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);

  const dispatch = useDispatch();
  const { productList } = useSelector((state) => state.adminProducts);

  // Fetch products, orders, and categories from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products using Redux
        dispatch(fetchAllProducts());

        const orderResponse = await fetch("/api/admin/orders/get");
        const orderData = await orderResponse.json();
        if (Array.isArray(orderData.data)) {
          setOrders(orderData.data);
        }

        // Extract unique categories from products
        if (productList && Array.isArray(productList)) {
          const uniqueCategories = [...new Set(productList.map(product => product.category))];
          setCategories(uniqueCategories);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, productList]);

  // Handle stock changes (increase or decrease)
  const handleStockChange = async (id, stockChange) => {
    const currentStock = productList.find((product) => product._id === id)?.totalStock || 0;
    
    // Prevent stock from going negative
    if (currentStock + stockChange >= 0) {
      try {
        const response = await fetch(`/api/admin/products/edit/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            totalStock: currentStock + stockChange,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update product");
        }

        // Refresh products after update
        dispatch(fetchAllProducts());
      } catch (error) {
        console.error('Error updating product:', error);
      }
    }
  };

  // Handle search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter products based on search query
  const filteredProducts = productList?.filter(
    (product) =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Handle product selection
  const handleProductSelect = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Handle select all products
  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(product => product._id));
    }
  };

  // Download selected products as CSV
  const downloadSelectedProducts = () => {
    if (selectedProducts.length === 0) {
      alert('Please select at least one product to download');
      return;
    }

    const selectedProductsData = productList.filter(product => 
      selectedProducts.includes(product._id)
    );

    const worksheet = XLSX.utils.json_to_sheet(selectedProductsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Selected Products");
    
    const csvOutput = XLSX.write(workbook, { bookType: "csv", type: "binary" });
    const blob = new Blob([csvOutput], { type: "application/octet-stream" });
    
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "selected_products.csv";
    link.click();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fafafa' }}>
      {/* Dashboard Overview */}
      <Box sx={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        {/* Total Products Box */}
        <Paper sx={{ flex: 1, padding: '20px', backgroundColor: '#e3f2fd', boxShadow: 3, borderRadius: '8px' }}>
          <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>Total Products</Typography>
          <Typography variant="h4" sx={{ color: '#333', fontWeight: 'bold' }}>{productList.length}</Typography>
        </Paper>

        {/* Total Orders Box */}
        <Paper sx={{ flex: 1, padding: '20px', backgroundColor: '#fff3e0', boxShadow: 3, borderRadius: '8px' }}>
          <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 'bold' }}>Total Orders</Typography>
          <Typography variant="h4" sx={{ color: '#333', fontWeight: 'bold' }}>{orders.length}</Typography>
        </Paper>

        {/* Total Categories Box */}
        <Paper sx={{ flex: 1, padding: '20px', backgroundColor: '#c8e6c9', boxShadow: 3, borderRadius: '8px' }}>
          <Typography variant="h6" sx={{ color: '#388e3c', fontWeight: 'bold' }}>Total Categories</Typography>
          <Typography variant="h4" sx={{ color: '#333', fontWeight: 'bold' }}>{categories.length}</Typography>
        </Paper>
      </Box>

      {/* Search and Download Section */}
      <Box sx={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <TextField
          label="Search Products"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ backgroundColor: '#fff', borderRadius: '8px' }}
        />
        <Button
          variant="contained"
          onClick={downloadSelectedProducts}
          disabled={selectedProducts.length === 0}
          sx={{
            background: 'linear-gradient(145deg, #1976d2, #2196f3)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '12px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              background: 'linear-gradient(145deg, #2196f3, #1976d2)',
              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
            },
            '&:disabled': {
              background: '#ccc',
              color: '#666',
            }
          }}
        >
          Download Selected ({selectedProducts.length})
        </Button>
      </Box>

      <Paper sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: 3 }}>
        <Typography variant="h4" sx={{ marginBottom: '20px', fontWeight: '', color: '#333' }}>
          Inventory
        </Typography>

        {/* Product Table */}
        <TableContainer component={Paper} sx={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    indeterminate={selectedProducts.length > 0 && selectedProducts.length < filteredProducts.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Image</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Brand</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Stock</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => handleProductSelect(product._id)}
                      />
                    </TableCell>
                    {/* Product Title */}
                    <TableCell>{product.title}</TableCell>

                    {/* Product Image */}
                    <TableCell>
                      <Avatar src={product.image} alt={product.title} sx={{ width: 50, height: 50 }} />
                    </TableCell>

                    {/* Product Category */}
                    <TableCell>{product.category}</TableCell>

                    {/* Product Brand */}
                    <TableCell>{product.brand}</TableCell>

                    {/* Product Stock */}
                    <TableCell>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {product.totalStock}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: '10px', marginTop: '10px', alignItems: 'center' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleStockChange(product._id, 1)} // Increase stock
                          sx={{
                            background: 'linear-gradient(145deg, #6fbf73, #81c784)', // Glass-like gradient
                            color: '#fff', // White text color
                            padding: '12px 24px', // Increased padding
                            borderRadius: '12px',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Soft shadow for depth
                            backdropFilter: 'blur(6px)', // Glass effect
                            border: '1px solid rgba(255, 255, 255, 0.3)', // Subtle border
                            '&:hover': {
                              background: 'linear-gradient(145deg, #81c784, #6fbf73)', // Reverse gradient on hover
                              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
                            },
                          }}
                        >
                          <KeyboardArrowUp /> Stock In
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => handleStockChange(product._id, -1)} // Decrease stock
                          disabled={product.totalStock <= 0} // Disable if stock is 0
                          sx={{
                            background: 'linear-gradient(145deg, #e57373, #d32f2f)', // Glass-like gradient
                            color: '#fff', // White text color
                            padding: '12px 24px', // Increased padding
                            borderRadius: '12px',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Soft shadow for depth
                            backdropFilter: 'blur(6px)', // Glass effect
                            border: '1px solid rgba(255, 255, 255, 0.3)', // Subtle border
                            '&:hover': {
                              background: 'linear-gradient(145deg, #d32f2f, #e57373)', // Reverse gradient on hover
                              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
                            },
                          }}
                        >
                          <KeyboardArrowDown /> Stock Out
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No products available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default InventoryPage;
