import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";

function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,
  currency,
  exchangeRates,
}) {
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    async function fetchCategoryName() {
      if (!product?.category) return;
      
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (data.categories) {
          const category = data.categories.find(cat => cat._id === product.category);
          if (category) {
            setCategoryName(category.name);
          } else {
            setCategoryName(product.category);
          }
        }
      } catch (error) {
        console.error("Error fetching category:", error);
        setCategoryName(product.category); 
      }
    }

    fetchCategoryName();
  }, [product?.category]);

  if (!product) {
    return <div>No product data available</div>;
  }

  const convertPrice = (price) => {
    if (!exchangeRates || !currency || !exchangeRates[currency]) {
      return price;
    }
    return (price * exchangeRates[currency]).toFixed(2);
  };

  const getCategoryNameStr = () => {
    const cat = String(product?.category || "").toLowerCase();
    const subcat = String(product?.subcategory || "").toLowerCase();
    
    if (cat.includes("ring") || subcat.includes("ring")) {
      if (!cat.includes("earring") && !cat.includes("earing") && !subcat.includes("earring") && !subcat.includes("earing")) {
        return "rings";
      }
    }
    if (cat.includes("chain") || subcat.includes("chain")) return "chains";
    if (cat.includes("bracelet") || subcat.includes("bracelet")) return "bracelets";
    return null;
  };
  const requiresSize = !!getCategoryNameStr();

  return (
    <div className="w-full max-w-sm mx-auto group">
      <div 
        onClick={() => handleGetProductDetails(product?.title.replace(/\s+/g, '-'))}
        className="relative aspect-[4/5] overflow-hidden mb-4 cursor-pointer bg-rosh-primary/5"
      >
        <img
          src={product?.image}
          alt={product?.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Badges */}
        {product?.totalStock === 0 ? (
          <Badge className="absolute top-4 left-4 bg-rosh-primary text-rosh-background rounded-none text-xs font-light tracking-wider uppercase px-3 py-1">
            Out Of Stock
          </Badge>
        ) : product?.salePrice > 0 ? (
          <Badge className="absolute top-4 left-4 bg-rosh-secondary text-rosh-primary rounded-none text-xs font-light tracking-wider uppercase px-3 py-1">
            Sale
          </Badge>
        ) : null}

        {/* Hover Add to Cart Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-100 translate-y-0 md:opacity-0 md:translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
           {product?.totalStock === 0 ? (
            <button 
              disabled
              className="w-full bg-rosh-background/90 text-rosh-primary py-3 uppercase text-xs tracking-widest cursor-not-allowed opacity-70"
            >
              Out Of Stock
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (requiresSize) {
                  handleGetProductDetails(product?.title.replace(/\s+/g, '-'));
                } else {
                  handleAddtoCart(product?._id, product?.totalStock);
                }
              }}
              className="w-full bg-rosh-background/95 hover:bg-rosh-primary hover:text-rosh-background transition-colors text-rosh-primary py-3 uppercase text-xs tracking-widest font-medium"
            >
              {requiresSize ? "Select Size" : "Add to cart"}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col text-center px-2 cursor-pointer" onClick={() => handleGetProductDetails(product?.title.replace(/\s+/g, '-'))}>
        <h2 className="text-lg font-serif text-rosh-primary mb-2 line-clamp-1">{product?.title}</h2>
        <div className="flex justify-center items-center gap-3 font-sans">
          <span className={`${product?.salePrice > 0 ? "line-through text-rosh-primary/50 text-sm" : "text-rosh-primary text-sm tracking-wide font-medium"}`}>
            {currency} {convertPrice(product?.price)}
          </span>
          {product?.salePrice > 0 && (
            <span className="text-rosh-accent text-sm tracking-wide font-medium">
              {currency} {convertPrice(product?.salePrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShoppingProductTile;
