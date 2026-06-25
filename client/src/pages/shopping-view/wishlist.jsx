import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { Badge } from "../../components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1, delayChildren: 0.2 } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } }
};

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = useSelector(state => state.auth.user?.id);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { currency, exchangeRates } = useSelector((state) => state.currency);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        if (!userId) return;
        const response = await fetch(`/api/wishlist/user/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch wishlist');
        const data = await response.json();
        setWishlist(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [userId]);

  const handleRemoveFromWishlist = async (e, Id) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/wishlist/${Id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setWishlist(prevWishlist => prevWishlist.filter(item => item._id !== Id));
        toast({ title: "Removed from selection" });
      } else {
        const responseData = await response.json();
        toast({ title: responseData.message || 'Failed to remove', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error removing item', variant: 'destructive' });
    }
  };

  const handleViewProductDetails = (productId) => {
    navigate(`/shop/product-details/${productId.replace(/\s+/g, '-')}`);
  };

  const handleAddtoCart = (e, getCurrentProductId, getTotalStock) => {
    e.stopPropagation();
    let getCartItems = cartItems.items || [];
    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex((item) => item.productId === getCurrentProductId);
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({ title: `Only ${getQuantity} quantity can be added`, variant: "destructive" });
          return;
        }
      }
    }

    dispatch(
      addToCart({
        userId: userId || null,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(userId || null));
        toast({ title: "Added to cart" });
      }
    });
  }

  const convertPrice = (price) => {
    if (!exchangeRates || !currency || !exchangeRates[currency]) return price;
    return (price * exchangeRates[currency]).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-rosh-background flex items-center justify-center text-rosh-primary">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 1, repeat: Infinity, repeatType: "reverse" } }} className="font-serif text-xl tracking-wider">
          Curating your selection...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return <div className="min-h-screen bg-rosh-background flex items-center justify-center text-red-500 font-sans tracking-widest uppercase text-sm">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-rosh-background text-rosh-primary font-sans pt-32 pb-24 px-4 md:px-8">
      <div className="max-w-[1600px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }} className="text-center mb-16 md:mb-24">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-rosh-primary capitalize mb-4">Your Selection</h1>
          {wishlist.length > 0 && (
            <p className="text-[10px] md:text-xs font-light tracking-[0.2em] uppercase text-rosh-primary/50">
              {wishlist.length} {wishlist.length === 1 ? 'Piece' : 'Pieces'} Saved
            </p>
          )}
        </motion.div>

        {wishlist.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }} className="flex flex-col items-center justify-center text-center max-w-md mx-auto py-12">
            <p className="font-serif text-2xl text-rosh-primary mb-8 italic">Your wishlist is currently empty</p>
            <button 
              onClick={() => navigate('/shop/listing')}
              className="bg-rosh-primary text-rosh-background px-10 py-4 uppercase tracking-[0.2em] text-[10px] hover:bg-rosh-accent hover:text-rosh-background transition-all duration-300"
            >
              Discover Collections
            </button>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16"
          >
            <AnimatePresence>
              {wishlist.map((item) => (
                <motion.div key={item._id} variants={itemVariants} exit="exit" className="w-full mx-auto group flex flex-col">
                  <div 
                    onClick={() => handleViewProductDetails(item.productId)}
                    className="relative aspect-[4/5] overflow-hidden mb-6 cursor-pointer bg-rosh-primary/5"
                  >
                    <img
                      src={item?.image}
                      alt={item?.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    
                    {/* Remove Button */}
                    <button 
                      onClick={(e) => handleRemoveFromWishlist(e, item._id)}
                      className="absolute top-4 right-4 z-10 p-2 text-rosh-primary/50 hover:text-rosh-accent hover:bg-rosh-background/50 rounded-full transition-all duration-300 md:opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-5 h-5" strokeWidth={1} />
                    </button>

                    {/* Badges */}
                    {item?.totalStock === 0 ? (
                      <Badge className="absolute top-4 left-4 bg-rosh-primary text-rosh-background rounded-none text-xs font-light tracking-wider uppercase px-3 py-1">
                        Out Of Stock
                      </Badge>
                    ) : item?.totalStock < 10 ? (
                      <Badge className="absolute top-4 left-4 bg-rosh-accent text-rosh-background rounded-none text-xs font-light tracking-wider uppercase px-3 py-1">
                        Low Stock
                      </Badge>
                    ) : item?.salePrice > 0 ? (
                      <Badge className="absolute top-4 left-4 bg-rosh-secondary text-rosh-primary rounded-none text-xs font-light tracking-wider uppercase px-3 py-1">
                        Sale
                      </Badge>
                    ) : null}

                    {/* Hover Add to Cart Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4 opacity-100 translate-y-0 md:opacity-0 md:translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                      {item?.totalStock === 0 ? (
                        <button disabled className="w-full bg-rosh-background/90 text-rosh-primary py-4 uppercase text-[10px] tracking-widest cursor-not-allowed opacity-70">
                          Out Of Stock
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleAddtoCart(e, item.productId, item.totalStock)}
                          className="w-full bg-rosh-background/95 hover:bg-rosh-primary hover:text-rosh-background transition-colors text-rosh-primary py-4 uppercase text-[10px] tracking-[0.2em] font-medium"
                        >
                          Add to cart
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col text-center px-2 cursor-pointer flex-1 justify-between" onClick={() => handleViewProductDetails(item.productId)}>
                    <div>
                      <h2 className="text-lg md:text-xl font-serif text-rosh-primary mb-3 line-clamp-2 leading-snug">{item?.title}</h2>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-rosh-primary/50 mb-4">{item?.category}</p>
                    </div>
                    <div className="flex justify-center items-center gap-3 font-sans">
                      <span className={`${item?.salePrice > 0 ? "line-through text-rosh-primary/40 text-xs" : "text-rosh-primary text-sm tracking-wide font-medium"}`}>
                        {currency} {convertPrice(item?.price)}
                      </span>
                      {item?.salePrice > 0 && (
                        <span className="text-rosh-accent text-sm tracking-wide font-medium">
                          {currency} {convertPrice(item?.salePrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
