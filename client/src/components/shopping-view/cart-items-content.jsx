import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";

function UserCartItemsContent({ cartItem }) {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);
  const { currency, exchangeRates } = useSelector((state) => state.currency); // Get currency and exchange rates from Redux
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Convert price based on selected currency
  const convertPrice = (price) => {
    return price; // Return price as is in INR
  };

  function handleUpdateQuantity(getCartItem, typeOfAction) {
    if (typeOfAction === "plus") {
      let getCartItems = cartItems.items || [];

      if (getCartItems.length) {
        const indexOfCurrentCartItem = getCartItems.findIndex(
          (item) => item.productId === getCartItem?.productId
        );

        const getCurrentProductIndex = productList.findIndex(
          (product) => product._id === getCartItem?.productId
        );
        const getTotalStock = productList[getCurrentProductIndex].totalStock;

        if (indexOfCurrentCartItem > -1) {
          const getQuantity = getCartItems[indexOfCurrentCartItem].quantity;
          if (getQuantity + 1 > getTotalStock) {
            toast({
              title: `Only ${getQuantity} quantity can be added for this item`,
              variant: "destructive",
            });

            return;
          }
        }
      }
    }

    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: getCartItem?.productId,
        quantity:
          typeOfAction === "plus"
            ? getCartItem?.quantity + 1
            : getCartItem?.quantity - 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item is updated successfully",
        });
      }
    });
  }

  function handleCartItemDelete(getCartItem) {
    dispatch(
      deleteCartItem({ userId: user?.id, productId: getCartItem?.productId })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item is deleted successfully",
        });
      }
    });
  }

  return (
    <div className="flex items-start space-x-4 py-4 border-b border-rosh-primary/10 last:border-0">
      <img
        src={cartItem?.image}
        alt={cartItem?.title}
        className="w-20 h-24 rounded-none object-cover"
      />
      <div className="flex-1 flex flex-col h-24 justify-between py-1">
        <h3 className="font-serif text-lg tracking-wide text-rosh-primary line-clamp-2">{cartItem?.title}</h3>
        
        <div className="flex items-center gap-3 mt-2 border border-rosh-primary/20 w-fit px-2 py-1">
          <button
            className="text-rosh-primary/60 hover:text-rosh-primary disabled:opacity-30 transition-colors"
            disabled={cartItem?.quantity === 1}
            onClick={() => handleUpdateQuantity(cartItem, "minus")}
          >
            <Minus className="w-3 h-3" strokeWidth={1.5} />
            <span className="sr-only">Decrease</span>
          </button>
          <span className="font-light text-sm w-4 text-center">{cartItem?.quantity}</span>
          <button
            className="text-rosh-primary/60 hover:text-rosh-primary transition-colors"
            onClick={() => handleUpdateQuantity(cartItem, "plus")}
          >
            <Plus className="w-3 h-3" strokeWidth={1.5} />
            <span className="sr-only">Increase</span>
          </button>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between h-24 py-1">
        <p className="font-serif text-rosh-primary tracking-wide">
          {currency}{" "}
          {(
            (cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price) *
            cartItem?.quantity
          )
            ? convertPrice(
                cartItem?.salePrice > 0
                  ? cartItem?.salePrice
                  : cartItem?.price
              )
            : "0.00"}
        </p>
        <button 
          onClick={() => handleCartItemDelete(cartItem)}
          className="text-rosh-primary/40 hover:text-rosh-accent transition-colors"
        >
          <Trash size={16} strokeWidth={1.5} />
          <span className="sr-only">Delete</span>
        </button>
      </div>
    </div>
  );
}

export default UserCartItemsContent;
