import ProductDetailsDialog from "@/pages/shopping-view/product-details";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { fetchProductDetails } from "@/store/shop/products-slice";
import {
  getSearchResults,
  resetSearchResults,
} from "@/store/shop/search-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom"; // Import useNavigate

function SearchProducts() {
  const [keyword, setKeyword] = useState("");
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Initialize useNavigate hook
  const { searchResults } = useSelector((state) => state.shopSearch);
  const { productDetails } = useSelector((state) => state.shopProducts);

  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { toast } = useToast();

  useEffect(() => {
    if (keyword && keyword.trim() !== "" && keyword.trim().length > 1) {
      setTimeout(() => {
        setSearchParams(new URLSearchParams(`?keyword=${keyword}`));
        dispatch(getSearchResults(keyword));
      }, 1000);
    } else {
      setSearchParams(new URLSearchParams(`?keyword=${keyword}`));
      dispatch(resetSearchResults());
    }
  }, [keyword]);

  function handleAddtoCart(getCurrentProductId, getTotalStock) {
    console.log(cartItems);
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });

          return;
        }
      }
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  }

  // Navigate to product details page
  function handleViewProductDetails(getCurrentProductId) {
    // Navigate to the product details page by ID
    navigate(`/product-details/${getCurrentProductId.replace(/\s+/g, '-')}`);
  }

  console.log(searchResults, "searchResults");

  return (
    <div className="min-h-screen bg-rosh-background flex flex-col">
      {/* Elegant Hero Search Section */}
      <div className="w-full flex flex-col items-center justify-center px-4 py-12 md:py-20 bg-rosh-primary/5 border-b border-rosh-primary/10">
        <h1 className="font-serif text-3xl md:text-4xl text-rosh-primary mb-6 tracking-wide text-center">Search Our Collection</h1>
        <div className="w-full max-w-2xl relative">
          <Input
            value={keyword}
            name="keyword"
            onChange={(event) => setKeyword(event.target.value)}
            className="py-6 px-6 w-full bg-white text-rosh-primary border border-rosh-primary/20 rounded-none focus-visible:ring-1 focus-visible:ring-rosh-primary focus-visible:border-rosh-primary text-base md:text-lg font-light tracking-wide shadow-sm placeholder:text-rosh-primary/40"
            placeholder="Search for rings, necklaces, diamonds..."
          />
        </div>
      </div>

      {/* Results Container */}
      <div className="container mx-auto px-4 md:px-6 py-12 flex-1">
        {/* Display 'No result found' */}
        {!searchResults.length && keyword && (
          <div className="w-full flex flex-col items-center justify-center py-16 opacity-80">
            <h2 className="text-2xl md:text-3xl font-serif text-rosh-primary tracking-wide mb-3">No results found</h2>
            <p className="text-rosh-primary/60 font-light tracking-wide text-center">We couldn't find anything matching "{keyword}".</p>
          </div>
        )}

        {/* Display Product Grid Only If Search Results Exist */}
        {searchResults.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {searchResults.map((item) => (
              <ShoppingProductTile
                key={item.id}
                handleAddtoCart={handleAddtoCart}
                product={item}
                handleGetProductDetails={handleViewProductDetails} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchProducts;
