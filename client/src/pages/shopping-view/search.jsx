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
    <div className="container mx-auto md:px-6 px-4 py-8">
      {/* Search Bar Section */}
      <div className="w-0 flex items-center justify-center fixed top-12 left-0 px-4 py-6 z-10 bg-white">
        <Input
          value={keyword}
          name="keyword"
          onChange={(event) => setKeyword(event.target.value)}
          className="py-6 w-full md:w-1/2"
          placeholder="Search Products..."
        />
      </div>

      {/* Container with Padding Adjustment for Fixed Search Bar */}
      <div className="mt-28"> {/* Adjusted to give enough space below the fixed search bar */}
        {/* Display 'No result found' when no search results are found */}
        {!searchResults.length && keyword && (
          <div className="w-full flex justify-center mt-10">
            <h1 className="text-5xl font-extrabold">No result found!</h1>
          </div>
        )}

        {/* Display Product Grid Only If Search Results Exist */}
        {searchResults.length > 0 && (
          <div className="overflow-y-auto max-h-screen mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {searchResults.map((item) => (
                <ShoppingProductTile
                  key={item.id}
                  handleAddtoCart={handleAddtoCart}
                  product={item}
                  handleGetProductDetails={handleViewProductDetails} // Use navigate function here
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Details Dialog (Optional, If Needed) */}
      {/* <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      /> */}
    </div>
  );
}

export default SearchProducts;
