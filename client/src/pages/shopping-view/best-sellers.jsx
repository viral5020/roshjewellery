import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import Footer from "@/components/shopping-view/footer";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";

function BestSellers() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { productList } = useSelector((state) => state.shopProducts);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { currency, exchangeRates } = useSelector((state) => state.currency);

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
      })
    );
  }, [dispatch]);

  function handleGetProductDetails(getCurrentProductId) {
    navigate(`/product-details/${getCurrentProductId}`);
  }

  function handleAddtoCart(getCurrentProductId, getTotalStock) {
    let getCartItems = cartItems?.items || [];
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
        userId: user?.id || null,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id || null));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  }

  const convertPrice = (price) => {
    if (!exchangeRates || !currency || !exchangeRates[currency]) return price;
    return (price * exchangeRates[currency]).toFixed(2);
  };

  const bestSellers = productList ? productList.filter((product) => product.isBestSeller) : [];

  return (
    <div className="bg-rosh-background md:min-h-screen text-rosh-primary font-sans flex flex-col">
      <div className="bg-rosh-background/95 backdrop-blur-md border-b border-rosh-primary/10 w-full shrink-0">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex-1 flex justify-start">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[10px] text-rosh-primary tracking-[0.2em] uppercase hover:text-rosh-accent transition-colors duration-300"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
              <span>Back</span>
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h1 className="font-serif text-2xl md:text-3xl text-rosh-primary capitalize m-0 leading-none">
              Best Sellers
            </h1>
            <span className="text-[9px] md:text-[10px] font-light text-rosh-primary/50 tracking-[0.2em] uppercase mt-2">
              {bestSellers.length} Products
            </span>
          </div>
          <div className="flex-1"></div>
        </div>
      </div>
      <div className="flex-1 flex flex-col w-full max-w-[1600px] mx-auto px-4 md:px-8 mt-6">
        <div className="w-full pb-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-6 lg:gap-x-8 gap-y-12 md:gap-y-16">
            {bestSellers.length > 0 ? (
              bestSellers.map((productItem) => (
                <ShoppingProductTile
                  key={productItem._id}
                  handleGetProductDetails={handleGetProductDetails}
                  product={productItem}
                  handleAddtoCart={handleAddtoCart}
                  currency={currency}
                  exchangeRates={exchangeRates}
                  convertedPrice={convertPrice(productItem.price)}
                  convertedSalePrice={
                    productItem.salePrice > 0 ? convertPrice(productItem.salePrice) : null
                  }
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-60">
                <p className="text-rosh-primary font-serif text-3xl italic mb-4">No pieces discovered.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default BestSellers;
