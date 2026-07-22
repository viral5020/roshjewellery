import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";
import { useSelector } from "react-redux";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate = useNavigate();
  const { currency, exchangeRates } = useSelector((state) => state.currency); // Get currency and exchange rates from the store
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);

  // Convert price based on selected currency
  const convertPrice = (price) => {
    if (!exchangeRates || !currency || !exchangeRates[currency]) {
      return price;
    }
    // Since price is in INR, multiply by the exchange rate to get the target currency
    return (price * exchangeRates[currency]).toFixed(2);
  };

  // Calculate total cart amount
  const totalCartAmount = cartItems.reduce((sum, currentItem) => {
    const itemPrice = currentItem?.salePrice > 0 ? currentItem?.salePrice : currentItem?.price;
    return sum + itemPrice * currentItem?.quantity;
  }, 0);

  // Calculate total weight from each product's actual weight
  const totalWeight =
    Array.isArray(cartItems) && cartItems.length > 0
      ? cartItems.reduce((sum, currentItem) => {
          // Ensure currentItem and productId are valid
          if (!currentItem || !currentItem.weight) return sum; // Use the weight directly from the cartItem
          const itemWeight = currentItem.weight; // Now using the weight from the product data populated from the backend
          return sum + itemWeight * (currentItem?.quantity || 1); // Sum the weight based on quantity
        }, 0)
      : 0;

  // Calculate shipping charges (150 Rs per kg)
  const shippingCharges = totalWeight * 150; // 150 Rs per kg for shipping

  // Convert total cart amount and shipping charges based on selected currency
  const totalCartAmountInCurrency = convertPrice(totalCartAmount);
  const shippingChargesInCurrency = convertPrice(shippingCharges);

  return (
    <SheetContent className="sm:max-w-md">
      <SheetHeader className="border-b border-rosh-primary/10 pb-4">
        <SheetTitle className="font-serif tracking-widest uppercase text-xl text-rosh-primary">Your Cart</SheetTitle>
      </SheetHeader>

      {/* Scrollable Cart Items Section */}
      <div className="mt-8 space-y-4 max-h-72 overflow-y-auto">
        {Array.isArray(cartItems) && cartItems.length > 0
          ? cartItems.map((item, index) => (
              <UserCartItemsContent key={index} cartItem={item} />
            ))
          : null}
      </div>

      <div className="mt-8 space-y-4 border-t border-rosh-primary/10 pt-6">
        <div className="flex justify-between text-sm">
          <span className="tracking-widest uppercase font-light text-rosh-primary/80">Subtotal</span>
          <span className="font-serif text-rosh-primary">{currency} {totalCartAmountInCurrency}</span>
        </div>

        {/* Add Shipping Charges */}
        <div className="flex justify-between text-sm">
          <span className="tracking-widest uppercase font-light text-rosh-primary/80">Shipping</span>
          <span className="font-serif text-rosh-primary">{currency} {shippingChargesInCurrency}</span>
        </div>

        {/* Display total amount with shipping charges */}
        <div className="flex justify-between mt-4 pt-4 border-t border-rosh-primary/10">
          <span className="tracking-widest uppercase text-rosh-primary font-medium">Total</span>
          <span className="font-serif text-lg text-rosh-primary">{currency} {(parseFloat(totalCartAmountInCurrency) + parseFloat(shippingChargesInCurrency)).toFixed(2)}</span>
        </div>
      </div>

      <Button
        onClick={() => setShowCheckoutPopup(true)}
        className="w-full mt-8 h-14 rounded-none bg-rosh-primary text-rosh-background hover:bg-rosh-highlight hover:text-rosh-background hover:scale-[1.01] transition-all duration-300 font-sans tracking-widest uppercase text-sm"
      >
        Checkout
      </Button>

      <Dialog open={showCheckoutPopup} onOpenChange={setShowCheckoutPopup}>
        <DialogContent className="sm:max-w-md p-8 bg-[#EBE5DE] border-none text-rosh-primary rounded-none shadow-2xl">
          <DialogHeader className="space-y-6">
            <DialogTitle className="font-serif italic text-3xl md:text-4xl text-center">
              Complete Your Order with Ease
            </DialogTitle>
            <DialogDescription className="font-serif text-lg leading-relaxed text-center text-rosh-primary/90 space-y-4">
              <p>We're currently enabling secure online payments to provide you with a seamless shopping experience.</p>
              <p>In the meantime, you can place your order by contacting us directly on WhatsApp or Call. Our team will assist you with your purchase, answer any questions, and help you complete your order.</p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            <a href="https://wa.me/917208200828" target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button className="w-full h-12 rounded-none bg-[#25D366] text-white hover:bg-[#128C7E] hover:scale-[1.02] transition-all duration-300 font-sans tracking-widest uppercase text-xs">
                Chat on WhatsApp
              </Button>
            </a>
            <a href="tel:+917208200828" className="flex-1">
              <Button className="w-full h-12 rounded-none border border-rosh-primary bg-transparent text-rosh-primary hover:bg-rosh-primary hover:text-rosh-background hover:scale-[1.02] transition-all duration-300 font-sans tracking-widest uppercase text-xs">
                Call Now
              </Button>
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </SheetContent>
  );
}

export default UserCartWrapper;
