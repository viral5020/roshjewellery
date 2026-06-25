import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ShoppingProductTile from "./product-tile";
import { selectCurrency, selectExchangeRates } from "@/store/shop/currency-slice";

function RecentlyViewedProducts() {
  const [recentProducts, setRecentProducts] = useState([]);
  const navigate = useNavigate();
  const currency = useSelector(selectCurrency);
  const exchangeRates = useSelector(selectExchangeRates);

  useEffect(() => {
    // Get recently viewed product IDs from localStorage
    const recentIds = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    
    // Fetch product details for each ID
    const fetchRecentProducts = async () => {
      const products = [];
      for (const id of recentIds) {
        try {
          const response = await fetch(`/api/shop/products/get/${id}`);
          const data = await response.json();
          if (data.success) {
            products.push(data.data);
          }
        } catch (error) {
          console.error("Error fetching product:", error);
        }
      }
      setRecentProducts(products);
    };

    fetchRecentProducts();
  }, []);

  if (recentProducts.length === 0) {
    return null;
  }

  const handleGetProductDetails = (productId) => {
    navigate(`/product-details/${productId}`);
  };

  const handleAddtoCart = (productId) => {
    // This function is required by ShoppingProductTile but we don't need to implement it
    // since we're not showing the add to cart button in recently viewed
    console.log("Add to cart clicked:", productId);
  };

  // Add currency conversion function
  const convertPrice = (price) => {
    if (!exchangeRates || !currency || !exchangeRates[currency]) {
      return price;
    }
    return (price * exchangeRates[currency]).toFixed(2);
  };

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold mb-4">Recently Viewed</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recentProducts.map((product) => (
          <ShoppingProductTile
            key={product._id}
            product={product}
            handleGetProductDetails={handleGetProductDetails}
            handleAddtoCart={handleAddtoCart}
            currency={currency}
            exchangeRates={exchangeRates}
            convertedPrice={convertPrice(product.price)}
            convertedSalePrice={product.salePrice > 0 ? convertPrice(product.salePrice) : null}
          />
        ))}
      </div>
    </section>
  );
}

export default RecentlyViewedProducts; 