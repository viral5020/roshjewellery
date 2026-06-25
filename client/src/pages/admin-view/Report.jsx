import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, List, ListItem, ListItemAvatar, ListItemText, Avatar, Alert, Divider } from '@mui/material';
import { useDispatch, useSelector } from "react-redux";
import { fetchMetalPrices, setMetalPrices } from "@/store/admin/metal-price-slice";
import { useToast } from "@/components/ui/use-toast";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Report = () => {
  const [salesData, setSalesData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCategories: 0
  });

  // Metal price state
  const [goldInput, setGoldInput] = useState("");
  const [silverInput, setSilverInput] = useState("");
  const [goldInputs, setGoldInputs] = useState({"24K": "", "22K": "", "21K": "", "20K": "", "18K": "", "14K": "", "10K": "", "9K": ""});
  const [silverInputs, setSilverInputs] = useState({"999": "", "958": "", "950": "", "925": "", "900": "", "835": "", "800": ""});
  const [diamondPriceInput, setDiamondPriceInput] = useState("");
  
  const dispatch = useDispatch();
  const { toast } = useToast();
  const {
    goldPrice,
    silverPrice,
    goldPrices,
    silverPrices,
    diamondPricePerCarat,
    isLoading: metalLoading,
    lastUpdated,
  } = useSelector((state) => state.metalPrice);

  // Fetch metal prices on mount
  useEffect(() => {
    dispatch(fetchMetalPrices());
  }, [dispatch]);

  // Populate inputs when prices are fetched
  useEffect(() => {
    if (goldPrice) setGoldInput(String(goldPrice));
    if (silverPrice) setSilverInput(String(silverPrice));
    if (diamondPricePerCarat) setDiamondPriceInput(String(diamondPricePerCarat));
    if (goldPrices) {
      setGoldInputs(prev => {
        const next = { ...prev };
        for (const k in goldPrices) next[k] = goldPrices[k] ? String(goldPrices[k]) : "";
        return next;
      });
    }
    if (silverPrices) {
      setSilverInputs(prev => {
        const next = { ...prev };
        for (const k in silverPrices) next[k] = silverPrices[k] ? String(silverPrices[k]) : "";
        return next;
      });
    }
  }, [goldPrice, silverPrice, goldPrices, silverPrices, diamondPricePerCarat]);

  function handleUpdateMetalPrices() {
    const gp = parseFloat(goldInput) || 0;
    const sp = parseFloat(silverInput) || 0;
    const dp = parseFloat(diamondPriceInput) || 0;
    
    const parsedGoldPrices = {};
    for (const key in goldInputs) parsedGoldPrices[key] = parseFloat(goldInputs[key]) || 0;
    
    const parsedSilverPrices = {};
    for (const key in silverInputs) parsedSilverPrices[key] = parseFloat(silverInputs[key]) || 0;

    dispatch(setMetalPrices({ 
      goldPrice: gp, 
      silverPrice: sp,
      goldPrices: parsedGoldPrices,
      silverPrices: parsedSilverPrices,
      diamondPricePerCarat: dp
    })).then(
      (data) => {
        if (data?.payload?.success) {
          toast({
            title: "Prices Updated ✓",
            description: data.payload.message,
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to update metal prices.",
            variant: "destructive",
          });
        }
      }
    );
  }

  const formattedDate = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch orders for sales data
        const ordersResponse = await fetch("/api/admin/orders/get");
        const ordersData = await ordersResponse.json();
        
        // Fetch products for product analytics
        const productsResponse = await fetch("/api/admin/products/get");
        const productsData = await productsResponse.json();

        if (ordersData.data && productsData.data) {
          setSalesData(ordersData.data);
          setProductData(productsData.data);
          
          // Process category data
          const categoryCount = productsData.data.reduce((acc, product) => {
            acc[product.category] = (acc[product.category] || 0) + 1;
            return acc;
          }, {});
          
          setCategoryData(categoryCount);

          // Set summary data
          setSummaryData({
            totalProducts: productsData.data.length,
            totalOrders: ordersData.data.length,
            totalCategories: Object.keys(categoryCount).length
          });

          // Filter low stock products (less than 10 items)
          const lowStock = productsData.data
            .filter(product => product.totalStock < 10)
            .sort((a, b) => a.totalStock - b.totalStock);
          setLowStockProducts(lowStock);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare monthly sales data
  const getMonthlySalesData = () => {
    const monthlySales = salesData.reduce((acc, order) => {
      const month = new Date(order.orderDate).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + order.totalAmount;
      return acc;
    }, {});

    return {
      labels: Object.keys(monthlySales),
      datasets: [
        {
          label: 'Monthly Sales',
          data: Object.values(monthlySales),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.4,
        },
      ],
    };
  };

  // Prepare top selling products data
  const getTopProductsData = () => {
    // First, create a map of product titles from the inventory
    const inventoryProducts = new Set(productData.map(product => product.title));

    const productSales = salesData.reduce((acc, order) => {
      order.cartItems.forEach(item => {
        // Only count products that exist in the inventory
        if (inventoryProducts.has(item.title)) {
          acc[item.title] = (acc[item.title] || 0) + item.quantity;
        }
      });
      return acc;
    }, {});

    const sortedProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      labels: sortedProducts.map(([title]) => title),
      datasets: [
        {
          label: 'Units Sold',
          data: sortedProducts.map(([, quantity]) => quantity),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
          ],
        },
      ],
    };
  };

  // Prepare category distribution data
  const getCategoryData = () => {
    return {
      labels: Object.keys(categoryData),
      datasets: [
        {
          label: 'Products by Category',
          data: Object.values(categoryData),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare low stock products chart data
  const getLowStockChartData = () => {
    const stockLevels = lowStockProducts.map(product => ({
      name: product.title,
      stock: product.totalStock
    })).sort((a, b) => a.stock - b.stock);

    return {
      labels: stockLevels.map(item => item.name),
      datasets: [
        {
          label: 'Current Stock',
          data: stockLevels.map(item => item.stock),
          backgroundColor: stockLevels.map(item => 
            item.stock === 0 ? 'rgba(255, 99, 132, 0.5)' : 'rgba(255, 206, 86, 0.5)'
          ),
          borderColor: stockLevels.map(item => 
            item.stock === 0 ? 'rgb(255, 99, 132)' : 'rgb(255, 206, 86)'
          ),
          borderWidth: 1,
        },
      ],
    };
  };

  const lowStockOptions = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Low Stock Products Overview',
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Items in Stock'
        }
      }
    }
  };

  // Chart options
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Sales Trend',
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top Selling Products',
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Product Distribution by Category',
      },
    },
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fafafa' }}>
      <Typography variant="h4" sx={{ marginBottom: '20px', fontWeight: 'bold' }}>
        E-commerce Analytics Dashboard
      </Typography>

      {/* ── Metal Prices Card ─────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          borderRadius: "16px",
          padding: "28px 32px",
          marginBottom: "32px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.06)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: "200px",
            height: "200px",
            background: "radial-gradient(circle, rgba(255,215,0,0.12) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            left: "-40px",
            width: "160px",
            height: "160px",
            background: "radial-gradient(circle, rgba(192,192,192,0.1) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#ffffff",
                margin: "0 0 4px 0",
                letterSpacing: "-0.02em",
              }}
            >
              💰 Today's Metal Prices
            </h2>
            <p
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.45)",
                margin: 0,
              }}
            >
              Set per-gram rates — product prices update automatically
              {formattedDate && (
                <span style={{ marginLeft: "12px", color: "rgba(255,255,255,0.3)" }}>
                  Last updated: {formattedDate}
                </span>
              )}
            </p>
          </div>
        </div>
        <div style={{ position: "relative", zIndex: 1, marginBottom: "20px" }}>
          <h3 style={{ color: "#FFD700", marginBottom: "12px", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>🥇 Gold Prices (₹/gram)</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "12px" }}>
            {Object.keys(goldInputs).map(karat => (
              <div key={karat}>
                <label style={{ display: "block", fontSize: "11px", color: "rgba(255,215,0,0.8)", marginBottom: "4px" }}>{karat}</label>
                <input type="number" value={goldInputs[karat]} onChange={e => setGoldInputs({...goldInputs, [karat]: e.target.value})} placeholder="0" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid rgba(255,215,0,0.25)", background: "rgba(255,215,0,0.06)", color: "#FFD700", outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 1, marginBottom: "20px" }}>
          <h3 style={{ color: "#C0C0C0", marginBottom: "12px", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>🥈 Silver Prices (₹/gram)</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "12px" }}>
            {Object.keys(silverInputs).map(mark => (
              <div key={mark}>
                <label style={{ display: "block", fontSize: "11px", color: "rgba(192,192,192,0.8)", marginBottom: "4px" }}>{mark}</label>
                <input type="number" value={silverInputs[mark]} onChange={e => setSilverInputs({...silverInputs, [mark]: e.target.value})} placeholder="0" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid rgba(192,192,192,0.25)", background: "rgba(192,192,192,0.06)", color: "#C0C0C0", outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ position: "relative", zIndex: 1, marginBottom: "20px" }}>
          <h3 style={{ color: "#00E5FF", marginBottom: "12px", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>💎 Diamond Price (₹/carat)</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", color: "rgba(0,229,255,0.8)", marginBottom: "4px" }}>Per Carat</label>
              <input type="number" value={diamondPriceInput} onChange={e => setDiamondPriceInput(e.target.value)} placeholder="0" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid rgba(0,229,255,0.25)", background: "rgba(0,229,255,0.06)", color: "#00E5FF", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>
        </div>
        
        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "flex-end" }}>
          <button
            id="update-metal-prices-btn"
            onClick={handleUpdateMetalPrices}
            disabled={metalLoading}
            style={{
              background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
              color: "#1a1a2e",
              fontWeight: "700",
              fontSize: "14px",
              padding: "12px 28px",
              borderRadius: "10px",
              border: "none",
              cursor: metalLoading ? "not-allowed" : "pointer",
              opacity: metalLoading ? 0.6 : 1,
              transition: "transform 0.15s, box-shadow 0.15s",
              boxShadow: "0 4px 14px rgba(255,215,0,0.25)",
              whiteSpace: "nowrap",
            }}
          >
            {metalLoading ? "Updating..." : "Update Prices"}
          </button>
        </div>
      </div>

      {/* Summary Boxes */}
      <Box sx={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        {/* Total Products Box */}
        <Paper sx={{ 
          flex: 1, 
          padding: '20px', 
          backgroundColor: '#e3f2fd', 
          boxShadow: 3, 
          borderRadius: '8px',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-5px)'
          }
        }}>
          <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
            Total Products
          </Typography>
          <Typography variant="h4" sx={{ color: '#333', fontWeight: 'bold', mt: 1 }}>
            {summaryData.totalProducts}
          </Typography>
        </Paper>

        {/* Total Orders Box */}
        <Paper sx={{ 
          flex: 1, 
          padding: '20px', 
          backgroundColor: '#fff3e0', 
          boxShadow: 3, 
          borderRadius: '8px',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-5px)'
          }
        }}>
          <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
            Total Orders
          </Typography>
          <Typography variant="h4" sx={{ color: '#333', fontWeight: 'bold', mt: 1 }}>
            {summaryData.totalOrders}
          </Typography>
        </Paper>

        {/* Total Categories Box */}
        <Paper sx={{ 
          flex: 1, 
          padding: '20px', 
          backgroundColor: '#c8e6c9', 
          boxShadow: 3, 
          borderRadius: '8px',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-5px)'
          }
        }}>
          <Typography variant="h6" sx={{ color: '#388e3c', fontWeight: 'bold' }}>
            Total Categories
          </Typography>
          <Typography variant="h4" sx={{ color: '#333', fontWeight: 'bold', mt: 1 }}>
            {summaryData.totalCategories}
          </Typography>
        </Paper>
      </Box>

      {/* Low Stock Products Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AlertTriangle className="text-yellow-500" />
          Low Stock Products
        </Typography>
        
        <Grid container spacing={3}>
          {/* List View */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, maxHeight: '400px', overflow: 'auto' }}>
              <List>
                {lowStockProducts.map((product, index) => (
                  <React.Fragment key={product._id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar 
                          src={product.image} 
                          alt={product.title}
                          variant="rounded"
                          sx={{ width: 60, height: 60, mr: 2 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" component="div">
                              {product.title}
                            </Typography>
                            <Alert 
                              severity={product.totalStock === 0 ? "error" : "warning"}
                              sx={{ 
                                py: 0,
                                px: 1,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5
                              }}
                            >
                              {product.totalStock === 0 ? (
                                <>
                                  <TrendingDown size={16} />
                                  Out of Stock
                                </>
                              ) : (
                                <>
                                  <TrendingUp size={16} />
                                  {product.totalStock} left
                                </>
                              )}
                            </Alert>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Brand: {product.brand}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Category: {product.category}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < lowStockProducts.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Chart View */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '400px' }}>
              <Bar options={lowStockOptions} data={getLowStockChartData()} />
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {/* Monthly Sales Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Line options={lineOptions} data={getMonthlySalesData()} />
          </Paper>
        </Grid>

        {/* Category Distribution Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Doughnut options={doughnutOptions} data={getCategoryData()} />
          </Paper>
        </Grid>

        {/* Top Selling Products Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Bar options={barOptions} data={getTopProductsData()} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Report;
