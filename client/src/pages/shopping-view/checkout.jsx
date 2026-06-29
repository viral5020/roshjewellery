import Address from "@/components/shopping-view/address";
import img from "../../assets/bann.png";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createNewOrder } from "@/store/shop/order-slice";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import { clearCart } from "@/store/shop/cart-slice";
import { clearLocalCart } from "@/store/shop/cart-slice/localCart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { approvalURL } = useSelector((state) => state.shopOrder);
  const [billingAddress, setBillingAddress] = useState(null);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [useSameAddress, setUseSameAddress] = useState(false); // Default to false to require both addresses
  const [isPaymentStart, setIsPaymemntStart] = useState(false);
  const [isOrderPlacing, setIsOrderPlacing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false); // New state to track Razorpay script loading
  const [paymentMethod, setPaymentMethod] = useState(null); // Track the selected payment method
  const { currency, exchangeRates } = useSelector((state) => state.currency);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate(); // Hook for navigation

  // New state for coupon
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0); // Store the discount amount
  const [freeShipping, setFreeShipping] = useState(false); // Store free shipping status
  const [availableCoupons, setAvailableCoupons] = useState([]); // Store available coupons
  const [showAvailableCoupons, setShowAvailableCoupons] = useState(false); // Toggle available coupons display

  // New state for guest checkout
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);
  const [guestShippingAddress, setGuestShippingAddress] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    pincode: "",
    phone: "",
    notes: "",
  });
  const [guestBillingAddress, setGuestBillingAddress] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    pincode: "",
    phone: "",
    notes: "",
  });

  // Add validation state
  const [validationErrors, setValidationErrors] = useState({
    shipping: {},
    billing: {},
  });

  // Dynamically load the Razorpay script
  useEffect(() => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    // When the script loads successfully
    script.onload = () => {
      console.log("Razorpay script loaded successfully");
      setRazorpayLoaded(true);
    };

    // If there is an error loading the script
    script.onerror = (error) => {
      console.error("Failed to load Razorpay script:", error);
      toast({
        title: "Failed to load payment system",
        description: "Please refresh the page and try again",
        variant: "destructive",
      });
    };

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Convert price based on selected currency
  const convertPrice = (price) => {
    if (!exchangeRates || !currency || !exchangeRates[currency]) {
      return price; // Return price as is if no exchange rate or currency available
    }
    return (price * exchangeRates[currency]).toFixed(2); // Convert price and format it
  };

  // Total amount of cart items in INR
  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  // Calculate total weight
  const totalWeight =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce((sum, currentItem) => {
          // Ensure currentItem is valid
          if (!currentItem) return sum;
          const itemWeight = currentItem?.weight || 1;
          return sum + itemWeight * (currentItem?.quantity || 1); // Sum the weight based on quantity
        }, 0)
      : 0;

  // Calculate shipping charges (150 Rs per kg)
  const shippingCharges = freeShipping ? 0 : totalWeight * 150;

  // Calculate the total amount with shipping (before discount)
  const totalAmountWithShipping = totalCartAmount + shippingCharges;

  // Calculate the total with discount
  const totalWithDiscount = totalAmountWithShipping - discount;

  // Convert to paise for Razorpay (1 INR = 100 paise)
  const amountInPaise = Math.round(totalWithDiscount * 100);

  // Log the amounts for debugging
  console.log('Cart Amount (INR):', totalCartAmount);
  console.log('Shipping Charges (INR):', shippingCharges);
  console.log('Total with Shipping (INR):', totalAmountWithShipping);
  console.log('Discount (INR):', discount);
  console.log('Final Amount (INR):', totalWithDiscount);
  console.log('Amount in Paise for Razorpay:', amountInPaise);

  // Handle PayPal payment
  const handleInitiatePaypalPayment = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });
      return;
    }
    if (!shippingAddress || (!useSameAddress && !billingAddress)) {
      toast({
        title: "Please select both shipping and billing addresses to proceed.",
        variant: "destructive",
      });
      return;
    }

    // Set payment method to 'paypal'
    setPaymentMethod("paypal");

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        image: singleCartItem?.image,
        price:
          singleCartItem?.salePrice > 0
            ? singleCartItem?.salePrice
            : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
      })),
      shippingAddress: {
        addressId: shippingAddress?._id,
        address: shippingAddress?.address,
        city: shippingAddress?.city,
        pincode: shippingAddress?.pincode,
        phone: shippingAddress?.phone,
        notes: shippingAddress?.notes,
      },
      billingAddress: useSameAddress ? {
        addressId: shippingAddress?._id,
        address: shippingAddress?.address,
        city: shippingAddress?.city,
        pincode: shippingAddress?.pincode,
        phone: shippingAddress?.phone,
        notes: shippingAddress?.notes,
      } : {
        addressId: billingAddress?._id,
        address: billingAddress?.address,
        city: billingAddress?.city,
        pincode: billingAddress?.pincode,
        phone: billingAddress?.phone,
        notes: billingAddress?.notes,
      },
      orderStatus: "pending",
      paymentMethod: "paypal",
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
    };

    setIsOrderPlacing(true);
    dispatch(createNewOrder(orderData)).then((data) => {
      if (data?.payload?.success) {
        setIsPaymemntStart(true);
      } else {
        setIsPaymemntStart(false);
        setIsOrderPlacing(false);
      }
    });
  };

  // Handle Razorpay payment
  const handleRazorpayPayment = async () => {
    if (!user) {
      // Validate guest addresses
      const isShippingValid = validateGuestAddress(guestShippingAddress, 'shipping');
      const isBillingValid = useSameAddress ? true : validateGuestAddress(guestBillingAddress, 'billing');
      
      if (!isShippingValid || !isBillingValid) {
        toast({
          title: "Please fix the validation errors",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!shippingAddress || (!useSameAddress && !billingAddress)) {
        toast({
          title: "Please select addresses",
          variant: "destructive",
        });
        return;
      }
    }

    setIsOrderPlacing(true);

    // Add debug logging
    console.log('Debug - User:', user);
    console.log('Debug - Cart Items:', cartItems);
    console.log('Debug - Shipping Address:', shippingAddress);
    console.log('Debug - Billing Address:', billingAddress);
    console.log('Debug - Payment Method:', paymentMethod);
    console.log('Debug - Total Amount:', totalWithDiscount);
    console.log('Debug - Shipping Charges:', shippingCharges);
    console.log('Debug - Total Weight:', totalWeight);

    // Validate stock availability before proceeding
    try {
      const stockCheckResponse = await fetch("/api/shop/order/check-stock", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems: cartItems.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        }),
      });

      const stockCheckResult = await stockCheckResponse.json();
      
      if (!stockCheckResult.success) {
        setIsOrderPlacing(false);
        toast({
          title: "Stock validation failed",
          description: stockCheckResult.message,
          variant: "destructive",
        });
        return;
      }
    } catch (error) {
      setIsOrderPlacing(false);
      console.error('Stock validation error:', error);
      toast({
        title: "Error checking stock",
        description: "Please try again later",
        variant: "destructive",
      });
      return;
    }
  
    if (!window.Razorpay) {
      setIsOrderPlacing(false);
      toast({
        title: "Payment system not loaded",
        description: "Please refresh the page and try again",
        variant: "destructive",
      });
      return;
    }
  
    setIsOrderPlacing(false);
    try {
      // Configure Razorpay payment options
      const options = {
        key: 'rzp_test_GIlOKSWDgEOf6H',
        amount: amountInPaise,
        currency: "INR",
        name: "Viral AJudia",
        description: `Payment for your order - Total: ₹${totalWithDiscount}`,
  
        handler: async function (response) {
          console.log('Payment response:', response);
          setIsOrderPlacing(true);
          try {
            // Create order in your database after successful payment
            const orderData = {
              userId: user?.id || null, // null for guest users
              cartId: cartItems?._id,
              cartItems: cartItems.items.map((singleCartItem) => ({
                productId: singleCartItem?.productId,
                title: singleCartItem?.title,
                image: singleCartItem?.image,
                price:
                  singleCartItem?.salePrice > 0
                    ? singleCartItem?.salePrice
                    : singleCartItem?.price,
                quantity: singleCartItem?.quantity,
              })),
              shippingAddress: user ? {
                addressId: shippingAddress?._id,
                address: shippingAddress?.address,
                city: shippingAddress?.city,
                pincode: shippingAddress?.pincode,
                phone: shippingAddress?.phone,
                notes: shippingAddress?.notes,
              } : {
                address: guestShippingAddress.address,
                city: guestShippingAddress.city,
                pincode: guestShippingAddress.pincode,
                phone: guestShippingAddress.phone,
                notes: guestShippingAddress.notes,
              },
              billingAddress: useSameAddress ? (user ? {
                addressId: shippingAddress?._id,
                address: shippingAddress?.address,
                city: shippingAddress?.city,
                pincode: shippingAddress?.pincode,
                phone: shippingAddress?.phone,
                notes: shippingAddress?.notes,
              } : {
                address: guestShippingAddress.address,
                city: guestShippingAddress.city,
                pincode: guestShippingAddress.pincode,
                phone: guestShippingAddress.phone,
                notes: guestShippingAddress.notes,
              }) : (user ? {
                addressId: billingAddress?._id,
                address: billingAddress?.address,
                city: billingAddress?.city,
                pincode: billingAddress?.pincode,
                phone: billingAddress?.phone,
                notes: billingAddress?.notes,
              } : {
                address: guestBillingAddress.address,
                city: guestBillingAddress.city,
                pincode: guestBillingAddress.pincode,
                phone: guestBillingAddress.phone,
                notes: guestBillingAddress.notes,
              }),
              orderStatus: "confirmed",
              paymentMethod: "razorpay",
              paymentStatus: "paid",
              totalAmount: totalWithDiscount,
              shippingCharges,
              totalWithShipping: totalWithDiscount,
              weight: totalWeight,
              orderDate: new Date(),
              orderUpdateDate: new Date(),
              paymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              couponCode: couponCode || null,
              discount: discount || 0,
              freeShipping: freeShipping || false,
              isGuestOrder: !user, // Add flag for guest orders
            };

            // Create order in your database
            const orderResponse = await fetch("/api/shop/order/create", {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(orderData),
            });

            const orderResult = await orderResponse.json();

            if (orderResult.success) {
              toast({
                title: "Payment successful!",
                variant: "success",
              });
              // Clear cart and redirect
              dispatch(clearCart());
              clearLocalCart();
              setIsOrderPlacing(false);
              if (user) {
                navigate("/shop/account");
              } else {
                navigate("/shop/order-success", { 
                  state: { orderDetails: orderResult.order }
                });
              }
            } else {
              throw new Error(orderResult.message || 'Failed to create order');
            }
          } catch (error) {
            console.error('Order creation error:', error);
            setIsOrderPlacing(false);
            toast({
              title: "Payment successful but order creation failed",
              description: error.message,
              variant: "destructive",
            });
          }
        },
  
        prefill: {
          name: user?.name || guestShippingAddress?.name || "Guest User",
          email: user?.email || guestShippingAddress?.email || "guest@example.com",
          contact: user ? shippingAddress?.phone : guestShippingAddress?.phone,
        },
  
        theme: {
          color: "#3399cc",
        },
      };
  
      console.log('Opening Razorpay with options:', options);
      
      try {
        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', function (response) {
          console.error('Payment failed:', response.error);
          toast({
            title: "Payment failed",
            description: response.error.description || "Payment could not be completed",
            variant: "destructive",
          });
        });
        
        razorpay.open();
      } catch (error) {
        console.error('Error creating Razorpay instance:', error);
        throw new Error('Failed to initialize payment window');
      }
  
    } catch (error) {
      console.error("Error while handling Razorpay payment:", error);
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Handle COD payment
  const handleCODOrder = () => {
    if (!user) {
      // Validate guest addresses
      const isShippingValid = validateGuestAddress(guestShippingAddress, 'shipping');
      const isBillingValid = useSameAddress ? true : validateGuestAddress(guestBillingAddress, 'billing');
      
      if (!isShippingValid || !isBillingValid) {
        toast({
          title: "Please fix the validation errors",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!shippingAddress || (!useSameAddress && !billingAddress)) {
        toast({
          title: "Please select addresses",
          variant: "destructive",
        });
        return;
      }
    }

    setIsOrderPlacing(true);

    // Add debug logging
    console.log('Debug - Guest Checkout Data:', {
      isGuestOrder: !user,
      cartItems: cartItems?.items,
      shippingAddress: user ? shippingAddress : guestShippingAddress,
      billingAddress: useSameAddress ? (user ? shippingAddress : guestShippingAddress) : (user ? billingAddress : guestBillingAddress),
      paymentMethod: 'cod',
      totalAmount: totalWithDiscount,
      shippingCharges,
      totalWithShipping: totalWithDiscount,
      weight: totalWeight
    });

    const orderData = {
      userId: user?.id || null, // null for guest users
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        image: singleCartItem?.image,
        price:
          singleCartItem?.salePrice > 0
            ? singleCartItem?.salePrice
            : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
      })),
      shippingAddress: user ? {
        addressId: shippingAddress?._id,
        address: shippingAddress?.address,
        city: shippingAddress?.city,
        pincode: shippingAddress?.pincode,
        phone: shippingAddress?.phone,
        notes: shippingAddress?.notes,
      } : {
        name: guestShippingAddress.name,
        email: guestShippingAddress.email,
        address: guestShippingAddress.address,
        city: guestShippingAddress.city,
        pincode: guestShippingAddress.pincode,
        phone: guestShippingAddress.phone,
        notes: guestShippingAddress.notes,
      },
      billingAddress: useSameAddress ? (user ? {
        addressId: shippingAddress?._id,
        address: shippingAddress?.address,
        city: shippingAddress?.city,
        pincode: shippingAddress?.pincode,
        phone: shippingAddress?.phone,
        notes: shippingAddress?.notes,
      } : {
        name: guestShippingAddress.name,
        email: guestShippingAddress.email,
        address: guestShippingAddress.address,
        city: guestShippingAddress.city,
        pincode: guestShippingAddress.pincode,
        phone: guestShippingAddress.phone,
        notes: guestShippingAddress.notes,
      }) : (user ? {
        addressId: billingAddress?._id,
        address: billingAddress?.address,
        city: billingAddress?.city,
        pincode: billingAddress?.pincode,
        phone: billingAddress?.phone,
        notes: billingAddress?.notes,
      } : {
        name: guestBillingAddress.name,
        email: guestBillingAddress.email,
        address: guestBillingAddress.address,
        city: guestBillingAddress.city,
        pincode: guestBillingAddress.pincode,
        phone: guestBillingAddress.phone,
        notes: guestBillingAddress.notes,
      }),
      orderStatus: "confirmed",
      paymentMethod: "cod",
      paymentStatus: "pending",
      totalAmount: totalWithDiscount,
      shippingCharges,
      totalWithShipping: totalWithDiscount,
      weight: totalWeight,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
      couponCode: couponCode || null,
      discount: discount || 0,
      freeShipping: freeShipping || false,
      isGuestOrder: !user, // Add flag for guest orders
    };

    // Add debug logging for final order data
    console.log('Debug - Final Order Data:', orderData);

    dispatch(createNewOrder(orderData)).then((data) => {
      if (data?.payload?.success) {
        // Clear cart before redirecting
        dispatch(clearCart());
        clearLocalCart();
        
        console.log('Order creation response:', data);
        console.log('Order ID:', data?.payload?.orderId);
        
        // Send confirmation email for COD order after successful order creation
        fetch("/api/email/send-order-confirmation", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: user?.email || guestShippingAddress.email,
            name: user?.name || guestShippingAddress.name,
            orderNumber: data?.payload?.orderId,
            totalAmount: totalCartAmount + shippingCharges,
            paymentMethod: "cod",
            orderStatus: "confirmed",
            orderDate: new Date().toISOString()
          }), 
        })
          .then((response) => response.text())
          .then((emailData) => {
            setIsOrderPlacing(false);
            if (emailData.includes("Order confirmation email sent.")) {
              toast({
                title: "Order placed successfully, confirmation email sent.",
                variant: "success",
              });
            } else {
              toast({
                title: "Order placed successfully, but failed to send email.",
                variant: "warning",
              });
            }
            if (user) {
              navigate("/shop/account");
            } else {
              navigate("/shop/order-success", { 
                state: { orderDetails: data.payload.order }
              });
            }
          })
          .catch((error) => {
            console.error("Error sending email:", error);
            setIsOrderPlacing(false);
            toast({
              title: "Order placed successfully, but failed to send email.",
              variant: "warning",
            });
            if (user) {
              navigate("/shop/account");
            } else {
              navigate("/shop/order-success", { 
                state: { orderDetails: data.payload.order }
              });
            }
          });
      } else {
        setIsOrderPlacing(false);
        toast({
          title: "Order placement failed",
          variant: "destructive",
        });
      }
    });
  };

  // Function to validate and apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Please enter a coupon code",
        variant: "destructive",
      });
      return;
    }

    if (!paymentMethod) {
      toast({
        title: "Please select a payment method first",
        description: "You need to select a payment method before applying a coupon",
        variant: "destructive",
      });
      return;
    }

    if (!user && !guestShippingAddress.email) {
      toast({
        title: "Please enter your email first",
        description: "You need to enter your email before applying a coupon",
        variant: "destructive",
      });
      return;
    }

    // Validate guest email format
    if (!user && guestShippingAddress.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestShippingAddress.email)) {
      toast({
        title: "Invalid email format",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!user && (!guestShippingAddress || (!useSameAddress && !guestBillingAddress))) {
      toast({
        title: "Please fill in your address details first",
        description: "You need to provide your shipping and billing addresses before applying a coupon",
        variant: "destructive",
      });
      return;
    }

    if (user && (!shippingAddress || (!useSameAddress && !billingAddress))) {
      toast({
        title: "Please select addresses first",
        description: "You need to select shipping and billing addresses before applying a coupon",
        variant: "destructive",
      });
      return;
    }

    if (cartItems?.items?.length === 0) {
      toast({
        title: "Your cart is empty",
        description: "Add items to your cart before applying a coupon",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/shop/coupon/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: couponCode.trim(),
          userId: user?.id,
          email: user ? user.email : guestShippingAddress.email,
          totalAmount: totalAmountWithShipping,
          paymentMethod: paymentMethod,
          cartItems: cartItems.items.map(item => ({
            productId: item.productId,
            product: {
              _id: item.productId,
              category: item.category
            },
            price: item.salePrice > 0 ? item.salePrice : item.price,
            quantity: item.quantity
          }))
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Calculate discount based on payment method only
        const discount = data.couponDetails.paymentMethodDiscountType === 'percentage'
          ? (totalAmountWithShipping * data.couponDetails.paymentMethodDiscount / 100)
          : data.couponDetails.paymentMethodDiscount;

        setDiscount(discount);
        setFreeShipping(data.freeShipping);
        toast({
          title: data.message,
          description: data.couponDetails && (
            <div className="mt-2">
              {data.couponDetails.category && (
                <p>Valid for: {data.couponDetails.category} category</p>
              )}
              {data.couponDetails.product && (
                <p>Valid for: {data.couponDetails.product}</p>
              )}
              <p>Payment Method: {paymentMethod === 'razorpay' ? 'Razorpay' : 'Cash on Delivery'}</p>
              <p>Discount: {data.couponDetails.paymentMethodDiscountType === 'percentage' 
                ? `${data.couponDetails.paymentMethodDiscount}%`
                : `₹${data.couponDetails.paymentMethodDiscount}`}</p>
            </div>
          ),
          variant: "success",
        });
      } else {
        setDiscount(0);
        setFreeShipping(false);
        toast({
          title: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      setDiscount(0);
      setFreeShipping(false);
      toast({
        title: "Error applying coupon",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  // Fetch available coupons
  const fetchAvailableCoupons = async () => {
    if (!cartItems?.items?.length) {
      setAvailableCoupons([]);
      return;
    }

    try {
      const response = await fetch("/api/shop/coupon/available", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          email: user ? user.email : guestShippingAddress.email,
          totalAmount: totalAmountWithShipping,
          cartItems: cartItems.items.map(item => ({
            productId: item.productId,
            product: {
              _id: item.productId,
              category: item.category
            },
            price: item.salePrice > 0 ? item.salePrice : item.price,
            quantity: item.quantity
          }))
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAvailableCoupons(data.coupons);
      } else {
        console.error("Error fetching coupons:", data.message);
        setAvailableCoupons([]);
      }
    } catch (error) {
      console.error("Error fetching available coupons:", error);
      setAvailableCoupons([]);
    }
  };

  // Fetch available coupons when component mounts or when relevant data changes
  useEffect(() => {
    if (cartItems?.items?.length > 0 && totalAmountWithShipping > 0) {
      fetchAvailableCoupons();
    }
  }, [cartItems?.items, totalAmountWithShipping, user?.id, guestShippingAddress.email]);

  // Reset coupon when cart changes
  useEffect(() => {
    setCouponCode("");
    setDiscount(0);
    setFreeShipping(false);
  }, [cartItems?.items]);

  // PayPal Payment Flow (Direct Integration via the PayPal SDK)
  if (approvalURL && paymentMethod === "paypal") {
    window.location.href = approvalURL;
  }

  // Validate guest address
  const validateGuestAddress = (address, type) => {
    const errors = {};
    
    if (!address.name?.trim()) {
      errors.name = "Name is required";
    }
    
    if (!address.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
      errors.email = "Invalid email format";
    }
    
    if (!address.address?.trim()) {
      errors.address = "Address is required";
    }
    
    if (!address.city?.trim()) {
      errors.city = "City is required";
    }
    
    if (!address.pincode?.trim()) {
      errors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(address.pincode)) {
      errors.pincode = "Pincode must be 6 digits";
    }
    
    if (!address.phone?.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(address.phone)) {
      errors.phone = "Phone number must be 10 digits";
    }

    setValidationErrors(prev => ({
      ...prev,
      [type]: errors
    }));

    return Object.keys(errors).length === 0;
  };

  // Update handleGuestAddressChange to handle name and email
  const handleGuestAddressChange = (type, field, value) => {
    if (type === 'shipping') {
      setGuestShippingAddress(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      setGuestBillingAddress(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate form
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      // Create order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          items: cartItems.items,
          totalAmount: totalCartAmount,
          shippingAddress: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country
          },
          paymentMethod: formData.paymentMethod
        })
      });

      const orderResult = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderResult.message || 'Failed to create order');
      }

      // Send confirmation email for COD orders
      if (formData.paymentMethod === 'cod') {
        try {
          const emailResponse = await fetch('/api/send-order-confirmation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              orderNumber: orderResult.order._id,
              totalAmount: orderResult.order.totalAmount,
              paymentMethod: orderResult.order.paymentMethod,
              orderStatus: orderResult.order.status,
              orderDate: orderResult.order.createdAt
            })
          });

          const emailResult = await emailResponse.text();
          console.log('Order confirmation email response:', emailResult);

          if (!emailResponse.ok) {
            console.warn('Failed to send order confirmation email:', emailResult);
            // Show warning but don't fail the order
            toast.warning('Order placed successfully, but there was an issue sending the confirmation email. Please check your email address.');
          } else {
            toast.success('Order placed successfully! A confirmation email has been sent to your email address.');
          }
        } catch (emailError) {
          console.error('Error sending order confirmation email:', emailError);
          // Show warning but don't fail the order
          toast.warning('Order placed successfully, but there was an issue sending the confirmation email. Please check your email address.');
        }
      } else {
        toast.success('Order placed successfully!');
      }

      // Clear cart and redirect
      dispatch(clearCart());
      navigate('/order-success', { 
        state: { 
          orderId: orderResult.order._id,
          emailSent: formData.paymentMethod === 'cod'
        }
      });
    } catch (error) {
      console.error('Error placing order:', error);
      setError(error.message || 'Failed to place order. Please try again.');
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-rosh-background min-h-screen text-rosh-primary font-sans flex flex-col items-center">
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="text-center mb-12 md:mb-20">
          <h1 className="font-serif text-3xl md:text-5xl italic text-rosh-primary mb-4">Secure Checkout</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-rosh-primary/50">
            Complete your order
          </p>
        </div>
      
      {(!user || isGuestCheckout) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 w-full">
          {/* Left Column: Forms */}
          <div className="lg:col-span-7 space-y-16">
            {/* Guest Shipping Address Section */}
            <div className="space-y-8">
              <h2 className="font-serif text-2xl italic text-rosh-primary border-b border-rosh-primary/10 pb-4">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/70 mb-2 block" htmlFor="shipping-name">Name</Label>
                  <Input
                    id="shipping-name"
                    value={guestShippingAddress.name}
                    onChange={(e) => handleGuestAddressChange('shipping', 'name', e.target.value)}
                    placeholder="Enter your name"
                    className={`border-0 border-b border-rosh-primary/20 rounded-none px-0 py-2 focus:outline-none focus:ring-0 outline-none bg-transparent text-sm shadow-none ${validationErrors.shipping.name ? "border-red-500" : ""}`}
                  />
                  {validationErrors.shipping.name && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.shipping.name}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/70 mb-2 block" htmlFor="shipping-email">Email</Label>
                  <Input
                    id="shipping-email"
                    type="email"
                    value={guestShippingAddress.email}
                    onChange={(e) => handleGuestAddressChange('shipping', 'email', e.target.value)}
                    placeholder="Enter your email"
                    className={`border-0 border-b border-rosh-primary/20 rounded-none px-0 py-2 focus:outline-none focus:ring-0 outline-none bg-transparent text-sm shadow-none ${validationErrors.shipping.email ? "border-red-500" : ""}`}
                  />
                  {validationErrors.shipping.email && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.shipping.email}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/70 mb-2 block" htmlFor="shipping-address">Address</Label>
                  <Input
                    id="shipping-address"
                    value={guestShippingAddress.address}
                    onChange={(e) => handleGuestAddressChange('shipping', 'address', e.target.value)}
                    placeholder="Enter your shipping address"
                    className={`border-0 border-b border-rosh-primary/20 rounded-none px-0 py-2 focus:outline-none focus:ring-0 outline-none bg-transparent text-sm shadow-none ${validationErrors.shipping.address ? "border-red-500" : ""}`}
                  />
                  {validationErrors.shipping.address && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.shipping.address}</p>
                  )}
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/70 mb-2 block" htmlFor="shipping-city">City</Label>
                  <Input
                    id="shipping-city"
                    value={guestShippingAddress.city}
                    onChange={(e) => handleGuestAddressChange('shipping', 'city', e.target.value)}
                    placeholder="Enter your city"
                    className={`border-0 border-b border-rosh-primary/20 rounded-none px-0 py-2 focus:outline-none focus:ring-0 outline-none bg-transparent text-sm shadow-none ${validationErrors.shipping.city ? "border-red-500" : ""}`}
                  />
                  {validationErrors.shipping.city && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.shipping.city}</p>
                  )}
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/70 mb-2 block" htmlFor="shipping-pincode">Pincode</Label>
                  <Input
                    id="shipping-pincode"
                    value={guestShippingAddress.pincode}
                    onChange={(e) => handleGuestAddressChange('shipping', 'pincode', e.target.value)}
                    placeholder="Enter your pincode"
                    className={`border-0 border-b border-rosh-primary/20 rounded-none px-0 py-2 focus:outline-none focus:ring-0 outline-none bg-transparent text-sm shadow-none ${validationErrors.shipping.pincode ? "border-red-500" : ""}`}
                  />
                  {validationErrors.shipping.pincode && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.shipping.pincode}</p>
                  )}
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/70 mb-2 block" htmlFor="shipping-phone">Phone</Label>
                  <Input
                    id="shipping-phone"
                    value={guestShippingAddress.phone}
                    onChange={(e) => handleGuestAddressChange('shipping', 'phone', e.target.value)}
                    placeholder="Enter your phone number"
                    className={`border-0 border-b border-rosh-primary/20 rounded-none px-0 py-2 focus:outline-none focus:ring-0 outline-none bg-transparent text-sm shadow-none ${validationErrors.shipping.phone ? "border-red-500" : ""}`}
                  />
                  {validationErrors.shipping.phone && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.shipping.phone}</p>
                  )}
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/70 mb-2 block" htmlFor="shipping-notes">Notes (Optional)</Label>
                  <Input
                    id="shipping-notes"
                    value={guestShippingAddress.notes}
                    onChange={(e) => handleGuestAddressChange('shipping', 'notes', e.target.value)}
                    placeholder="Any additional notes"
                    className="border-0 border-b border-rosh-primary/20 rounded-none px-0 py-2 focus:outline-none focus:ring-0 outline-none bg-transparent text-sm shadow-none"
                  />
                </div>
              </div>
            </div>

            {/* Guest Billing Address Section */}
            <div className="space-y-8 pt-8 border-t border-rosh-primary/10">
              <div className="flex items-center justify-between pb-4">
                <h2 className="font-serif text-2xl italic text-rosh-primary">Billing Address</h2>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="useSameAddressGuest"
                    checked={useSameAddress}
                    onChange={(e) => {
                      setUseSameAddress(e.target.checked);
                      if (e.target.checked) {
                        setGuestBillingAddress(guestShippingAddress);
                        setValidationErrors(prev => ({
                          ...prev,
                          billing: {}
                        }));
                      }
                    }}
                    className="h-3 w-3 accent-rosh-primary rounded-none border-rosh-primary/20"
                  />
                  <label htmlFor="useSameAddressGuest" className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/70 cursor-pointer">
                    Same as shipping
                  </label>
                </div>
              </div>

              {!useSameAddress && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <Label className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/70 mb-2 block" htmlFor="billing-name">Name</Label>
                    <Input
                      id="billing-name"
                      value={guestBillingAddress.name}
                      onChange={(e) => handleGuestAddressChange('billing', 'name', e.target.value)}
                      placeholder="Enter your name"
                      className={`border-0 border-b border-rosh-primary/20 rounded-none px-0 py-2 focus:outline-none focus:ring-0 outline-none bg-transparent text-sm shadow-none ${validationErrors.billing.name ? "border-red-500" : ""}`}
                    />
                    {validationErrors.billing.name && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.billing.name}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/70 mb-2 block" htmlFor="billing-email">Email</Label>
                    <Input
                      id="billing-email"
                      type="email"
                      value={guestBillingAddress.email}
                      onChange={(e) => handleGuestAddressChange('billing', 'email', e.target.value)}
                      placeholder="Enter your email"
                      className={`border-0 border-b border-rosh-primary/20 rounded-none px-0 py-2 focus:outline-none focus:ring-0 outline-none bg-transparent text-sm shadow-none ${validationErrors.billing.email ? "border-red-500" : ""}`}
                    />
                    {validationErrors.billing.email && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.billing.email}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/70 mb-2 block" htmlFor="billing-address">Address</Label>
                    <Input
                      id="billing-address"
                      value={guestBillingAddress.address}
                      onChange={(e) => handleGuestAddressChange('billing', 'address', e.target.value)}
                      placeholder="Enter your billing address"
                      className={`border-0 border-b border-rosh-primary/20 rounded-none px-0 py-2 focus:outline-none focus:ring-0 outline-none bg-transparent text-sm shadow-none ${validationErrors.billing.address ? "border-red-500" : ""}`}
                    />
                    {validationErrors.billing.address && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.billing.address}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/70 mb-2 block" htmlFor="billing-city">City</Label>
                    <Input
                      id="billing-city"
                      value={guestBillingAddress.city}
                      onChange={(e) => handleGuestAddressChange('billing', 'city', e.target.value)}
                      placeholder="Enter your city"
                      className={`border-0 border-b border-rosh-primary/20 rounded-none px-0 py-2 focus:outline-none focus:ring-0 outline-none bg-transparent text-sm shadow-none ${validationErrors.billing.city ? "border-red-500" : ""}`}
                    />
                    {validationErrors.billing.city && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.billing.city}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/70 mb-2 block" htmlFor="billing-pincode">Pincode</Label>
                    <Input
                      id="billing-pincode"
                      value={guestBillingAddress.pincode}
                      onChange={(e) => handleGuestAddressChange('billing', 'pincode', e.target.value)}
                      placeholder="Enter your pincode"
                      className={`border-0 border-b border-rosh-primary/20 rounded-none px-0 py-2 focus:outline-none focus:ring-0 outline-none bg-transparent text-sm shadow-none ${validationErrors.billing.pincode ? "border-red-500" : ""}`}
                    />
                    {validationErrors.billing.pincode && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.billing.pincode}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/70 mb-2 block" htmlFor="billing-phone">Phone</Label>
                    <Input
                      id="billing-phone"
                      value={guestBillingAddress.phone}
                      onChange={(e) => handleGuestAddressChange('billing', 'phone', e.target.value)}
                      placeholder="Enter your phone number"
                      className={`border-0 border-b border-rosh-primary/20 rounded-none px-0 py-2 focus:outline-none focus:ring-0 outline-none bg-transparent text-sm shadow-none ${validationErrors.billing.phone ? "border-red-500" : ""}`}
                    />
                    {validationErrors.billing.phone && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.billing.phone}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/70 mb-2 block" htmlFor="billing-notes">Notes (Optional)</Label>
                    <Input
                      id="billing-notes"
                      value={guestBillingAddress.notes}
                      onChange={(e) => handleGuestAddressChange('billing', 'notes', e.target.value)}
                      placeholder="Any additional notes"
                      className="border-0 border-b border-rosh-primary/20 rounded-none px-0 py-2 focus:outline-none focus:ring-0 outline-none bg-transparent text-sm shadow-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-white/40 p-6 md:p-8 rounded-none border border-rosh-primary/10 sticky top-24">
              <h2 className="font-serif text-2xl italic text-rosh-primary border-b border-rosh-primary/10 pb-4 mb-6">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="flex flex-col gap-4 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2 mb-8 border-b border-rosh-primary/10 pb-6">
                {cartItems && cartItems.items && cartItems.items.length > 0
                  ? cartItems.items.map((item) => (
                      <UserCartItemsContent cartItem={item} />
                    ))
                  : null}
              </div>

              {/* Totals */}
              <div className="space-y-4 mb-8 border-b border-rosh-primary/10 pb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-rosh-primary/70 uppercase tracking-[0.1em] text-[10px]">Subtotal ({currency})</span>
                  <span>{convertPrice(totalCartAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-rosh-primary/70 uppercase tracking-[0.1em] text-[10px]">Shipping ({currency})</span>
                  <span>{convertPrice(shippingCharges)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="uppercase tracking-[0.1em] text-[10px]">Discount</span>
                    <span>-{convertPrice(discount)}</span>
                  </div>
                )}
                {freeShipping && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="uppercase tracking-[0.1em] text-[10px]">Shipping Discount</span>
                    <span>Free Shipping Applied</span>
                  </div>
                )}
                <div className="flex justify-between font-serif text-xl italic pt-2">
                  <span>Total</span>
                  <span>{convertPrice(totalWithDiscount)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-8 border-b border-rosh-primary/10 pb-6">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium text-rosh-primary/70 mb-4">Payment Method</h3>
                <div className="flex flex-col gap-4">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${paymentMethod === 'razorpay' ? 'border-rosh-primary' : 'border-rosh-primary/30 group-hover:border-rosh-primary/60'}`}>
                      {paymentMethod === 'razorpay' && <div className="w-2 h-2 bg-rosh-primary rounded-full"></div>}
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === "razorpay"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="hidden"
                    />
                    <span className="text-sm tracking-wide">Razorpay (Cards, UPI, NetBanking)</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${paymentMethod === 'cod' ? 'border-rosh-primary' : 'border-rosh-primary/30 group-hover:border-rosh-primary/60'}`}>
                      {paymentMethod === 'cod' && <div className="w-2 h-2 bg-rosh-primary rounded-full"></div>}
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="hidden"
                    />
                    <span className="text-sm tracking-wide">Cash on Delivery</span>
                  </label>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="mb-8">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium text-rosh-primary/70 mb-4">Promo Code</h3>
                <div className="flex gap-4 mb-4 items-end">
                  <Input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter Code"
                    className="border-0 border-b border-rosh-primary/20 rounded-none px-0 py-2 focus:outline-none focus:ring-0 outline-none bg-transparent text-sm shadow-none uppercase flex-1"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="text-[10px] uppercase tracking-[0.2em] border-b border-rosh-primary hover:text-rosh-accent hover:border-rosh-accent transition-colors pb-1 mb-1"
                  >
                    Apply
                  </button>
                </div>
                
                {/* Available Coupons Button */}
                <button
                  onClick={() => setShowAvailableCoupons(!showAvailableCoupons)}
                  className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/50 hover:text-rosh-primary transition-colors flex items-center gap-1"
                >
                  {showAvailableCoupons ? "Hide Offers" : "View Available Offers"}
                </button>

                {/* Available Coupons List */}
                {showAvailableCoupons && (
                  <div className="mt-4 space-y-3">
                    {availableCoupons.length > 0 ? (
                      availableCoupons.map((coupon) => (
                        <div
                          key={coupon.code}
                          className="p-4 border border-rosh-primary/10 bg-white/30 cursor-pointer hover:border-rosh-primary/30 transition-all duration-300"
                          onClick={() => {
                            setCouponCode(coupon.code);
                            setShowAvailableCoupons(false);
                          }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-serif text-lg italic">{coupon.code}</p>
                            <p className="text-sm font-medium text-rosh-primary">
                              {coupon.paymentMethodDiscountType === 'percentage' 
                                ? `${coupon.paymentMethodDiscount}% OFF`
                                : `₹${coupon.paymentMethodDiscount} OFF`}
                            </p>
                          </div>
                          <p className="text-[10px] uppercase tracking-[0.1em] text-rosh-primary/60 mb-2">{coupon.description}</p>
                          {coupon.freeShipping && <p className="text-[10px] uppercase tracking-[0.1em] text-green-600">+ Free Shipping</p>}
                        </div>
                      ))
                    ) : (
                      <div className="text-[10px] uppercase tracking-[0.1em] text-rosh-primary/50 py-2">
                        No offers available
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Checkout Action */}
              <button
                onClick={paymentMethod === "cod" ? handleCODOrder : handleRazorpayPayment}
                disabled={!paymentMethod}
                className="w-full bg-rosh-primary text-rosh-background py-4 text-[10px] uppercase tracking-[0.3em] hover:bg-rosh-accent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!paymentMethod ? "Select Payment" : `Checkout with ${paymentMethod === 'cod' ? 'COD' : 'Razorpay'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {user && !isGuestCheckout && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 w-full">
          <div className="lg:col-span-7 space-y-16">
            {/* Shipping Address Section */}
            <div className="space-y-8">
              <h2 className="font-serif text-2xl italic text-rosh-primary border-b border-rosh-primary/10 pb-4">Shipping Address</h2>
              <div className="pt-2">
                <Address
                  selectedId={shippingAddress}
                  setCurrentSelectedAddress={setShippingAddress}
                  addressType="shipping"
                />
                {!shippingAddress && (
                  <p className="text-red-500 text-xs mt-2">Please select a shipping address</p>
                )}
              </div>
            </div>
            
            {/* Billing Address Section */}
            <div className="space-y-8 pt-8 border-t border-rosh-primary/10">
              <div className="flex items-center justify-between pb-4">
                <h2 className="font-serif text-2xl italic text-rosh-primary">Billing Address</h2>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="useSameAddressAuth"
                    checked={useSameAddress}
                    onChange={(e) => {
                      setUseSameAddress(e.target.checked);
                      if (e.target.checked) {
                        setBillingAddress(shippingAddress);
                      } else {
                        setBillingAddress(null);
                      }
                    }}
                    className="h-3 w-3 accent-rosh-primary rounded-none border-rosh-primary/20"
                  />
                  <label htmlFor="useSameAddressAuth" className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/70 cursor-pointer">
                    Same as shipping
                  </label>
                </div>
              </div>

              {!useSameAddress && (
                <div className="pt-2">
                  <Address
                    selectedId={billingAddress}
                    setCurrentSelectedAddress={setBillingAddress}
                    addressType="billing"
                  />
                  {!billingAddress && (
                    <p className="text-red-500 text-xs mt-2">Please select a billing address</p>
                  )}
                </div>
              )}

              {useSameAddress && shippingAddress && (
                <div className="bg-white/40 p-6 border border-rosh-primary/10 flex flex-col gap-2 text-rosh-primary">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/50 mb-2">Using shipping address for billing</p>
                  <p className="text-sm"><span className="text-[10px] uppercase tracking-[0.1em] text-rosh-primary/50 mr-2">Address:</span> {shippingAddress.address}</p>
                  <p className="text-sm"><span className="text-[10px] uppercase tracking-[0.1em] text-rosh-primary/50 mr-2">City:</span> {shippingAddress.city}</p>
                  <p className="text-sm"><span className="text-[10px] uppercase tracking-[0.1em] text-rosh-primary/50 mr-2">Pincode:</span> {shippingAddress.pincode}</p>
                  <p className="text-sm"><span className="text-[10px] uppercase tracking-[0.1em] text-rosh-primary/50 mr-2">Phone:</span> {shippingAddress.phone}</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-white/40 p-6 md:p-8 rounded-none border border-rosh-primary/10 sticky top-24">
              <h2 className="font-serif text-2xl italic text-rosh-primary border-b border-rosh-primary/10 pb-4 mb-6">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="flex flex-col gap-4 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2 mb-8 border-b border-rosh-primary/10 pb-6">
                {cartItems && cartItems.items && cartItems.items.length > 0
                  ? cartItems.items.map((item) => (
                      <UserCartItemsContent cartItem={item} />
                    ))
                  : null}
              </div>

              {/* Totals */}
              <div className="space-y-4 mb-8 border-b border-rosh-primary/10 pb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-rosh-primary/70 uppercase tracking-[0.1em] text-[10px]">Subtotal ({currency})</span>
                  <span>{convertPrice(totalCartAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-rosh-primary/70 uppercase tracking-[0.1em] text-[10px]">Shipping ({currency})</span>
                  <span>{convertPrice(shippingCharges)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="uppercase tracking-[0.1em] text-[10px]">Discount</span>
                    <span>-{convertPrice(discount)}</span>
                  </div>
                )}
                {freeShipping && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="uppercase tracking-[0.1em] text-[10px]">Shipping Discount</span>
                    <span>Free Shipping Applied</span>
                  </div>
                )}
                <div className="flex justify-between font-serif text-xl italic pt-2">
                  <span>Total</span>
                  <span>{convertPrice(totalWithDiscount)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-8 border-b border-rosh-primary/10 pb-6">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium text-rosh-primary/70 mb-4">Payment Method</h3>
                <div className="flex flex-col gap-4">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${paymentMethod === 'razorpay' ? 'border-rosh-primary' : 'border-rosh-primary/30 group-hover:border-rosh-primary/60'}`}>
                      {paymentMethod === 'razorpay' && <div className="w-2 h-2 bg-rosh-primary rounded-full"></div>}
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === "razorpay"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="hidden"
                    />
                    <span className="text-sm tracking-wide">Razorpay (Cards, UPI, NetBanking)</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${paymentMethod === 'cod' ? 'border-rosh-primary' : 'border-rosh-primary/30 group-hover:border-rosh-primary/60'}`}>
                      {paymentMethod === 'cod' && <div className="w-2 h-2 bg-rosh-primary rounded-full"></div>}
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="hidden"
                    />
                    <span className="text-sm tracking-wide">Cash on Delivery</span>
                  </label>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="mb-8">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium text-rosh-primary/70 mb-4">Promo Code</h3>
                <div className="flex gap-4 mb-4 items-end">
                  <Input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter Code"
                    className="border-0 border-b border-rosh-primary/20 rounded-none px-0 py-2 focus:outline-none focus:ring-0 outline-none bg-transparent text-sm shadow-none uppercase flex-1"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="text-[10px] uppercase tracking-[0.2em] border-b border-rosh-primary hover:text-rosh-accent hover:border-rosh-accent transition-colors pb-1 mb-1"
                  >
                    Apply
                  </button>
                </div>
                
                {/* Available Coupons Button */}
                <button
                  onClick={() => setShowAvailableCoupons(!showAvailableCoupons)}
                  className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/50 hover:text-rosh-primary transition-colors flex items-center gap-1"
                >
                  {showAvailableCoupons ? "Hide Offers" : "View Available Offers"}
                </button>
                
                {/* Available Coupons List */}
                {showAvailableCoupons && (
                  <div className="mt-4 space-y-3">
                    {availableCoupons.length > 0 ? (
                      availableCoupons.map((coupon) => (
                        <div
                          key={coupon.code}
                          className="p-4 border border-rosh-primary/10 bg-white/30 cursor-pointer hover:border-rosh-primary/30 transition-all duration-300"
                          onClick={() => {
                            setCouponCode(coupon.code);
                            setShowAvailableCoupons(false);
                          }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-serif text-lg italic">{coupon.code}</p>
                            <p className="text-sm font-medium text-rosh-primary">
                              {coupon.paymentMethodDiscountType === 'percentage' 
                                ? `${coupon.paymentMethodDiscount}% OFF`
                                : `₹${coupon.paymentMethodDiscount} OFF`}
                            </p>
                          </div>
                          <p className="text-[10px] uppercase tracking-[0.1em] text-rosh-primary/60 mb-2">{coupon.description}</p>
                          {coupon.freeShipping && <p className="text-[10px] uppercase tracking-[0.1em] text-green-600">+ Free Shipping</p>}
                        </div>
                      ))
                    ) : (
                      <div className="text-[10px] uppercase tracking-[0.1em] text-rosh-primary/50 py-2">
                        No offers available
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Checkout Action */}
              <button
                onClick={paymentMethod === "cod" ? handleCODOrder : handleRazorpayPayment}
                disabled={!paymentMethod || !shippingAddress || (!billingAddress && !useSameAddress)}
                className="w-full bg-rosh-primary text-rosh-background py-4 text-[10px] uppercase tracking-[0.3em] hover:bg-rosh-accent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!paymentMethod ? "Select Payment" : `Checkout with ${paymentMethod === 'cod' ? 'COD' : 'Razorpay'}`}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isOrderPlacing && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="flex flex-col items-center p-8 bg-white rounded-none border border-rosh-primary/10 shadow-2xl max-w-sm w-full text-center">
            <Loader2 className="h-10 w-10 animate-spin text-rosh-primary mb-4" />
            <h3 className="font-serif text-xl italic text-rosh-primary mb-2">Processing Order</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/60">
              Please do not refresh or close the page
            </p>
          </div>
        </div>
      )}
      
      {/* Hide Chatbot Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        #rcb-chat-bot, .rcb-chat-bot, [class^="rcb-"], [id^="rcb-"] {
          display: none !important;
        }
      `}} />
      </div>
    </div>
  );
}

export default ShoppingCheckout;
