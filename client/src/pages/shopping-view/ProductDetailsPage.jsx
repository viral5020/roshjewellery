import product1Image from "@/assets/product1.webp";
import product2Image from "@/assets/product2.webp";
import product3Image from "@/assets/product3.webp";
import product4Image from "@/assets/product4.webp";
import Footer from "@/components/shopping-view/footer";
import GoogleReviewsSection from "@/components/shopping-view/googlereview";
import ShoppingHeader from "@/components/shopping-view/header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import {
  setProductDetails,
  fetchProductDetailsByTitle
} from "@/store/shop/products-slice";
import { ArrowLeftCircle, File, Gift, Heart, MessageCircle, RefreshCcw, Truck, ShieldCheck, Star, Ruler } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SimilarProducts from "@/components/shopping-view/similar-products";
import StarRatingComponent from "@/components/common/star-rating";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { getReviews, addReview } from "@/store/shop/review-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import RecentlyViewedProducts from "@/components/shopping-view/recently-viewed-products";
import { selectCurrency, selectExchangeRates } from "@/store/shop/currency-slice";

const AccordionItem = ({ title, children, isOpen, onClick }) => {
  return (
    <div className="border-b border-rosh-primary/10">
      <button 
        className="w-full py-4 flex justify-between items-center text-left focus:outline-none group" 
        onClick={onClick}
      >
        <span className="font-serif text-xl tracking-wide group-hover:text-rosh-accent transition-colors">{title}</span>
        <span className="text-2xl text-rosh-primary/50 font-light group-hover:text-rosh-accent transition-colors">
          {isOpen ? '−' : '+'}
        </span>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[800px] pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="text-rosh-primary/80 font-light text-[15px] leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  )
};

function ProductDetailsPage() {
  const { title } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { productDetails, loading } = useSelector((state) => state.shopProducts);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const currency = useSelector(selectCurrency);
  const exchangeRates = useSelector(selectExchangeRates);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const { reviews } = useSelector((state) => state.shopReview);
  const [openAccordion, setOpenAccordion] = useState("specifications");
  const { toast } = useToast();
  
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);

  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);

  const averageReview = reviews?.length > 0
    ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) / reviews.length
    : 0;

  const toggleAccordion = (id) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const COLOR_LABELS = {
    "rose-gold": "Rose Gold",
    "white-gold": "White Gold",
    "yellow-gold": "Yellow Gold",
    "silver-polished": "Silver Polished",
    "yellow-polished": "Yellow Polished",
    "rose-gold-polished": "Rose Gold Polished",
  };

  const COLOR_SWATCHES = {
    "rose-gold": "linear-gradient(135deg, #e8b4a0, #d4956b)",
    "white-gold": "linear-gradient(135deg, #f0f0f0, #c8c8c8)",
    "yellow-gold": "linear-gradient(135deg, #ffd700, #c8a600)",
    "silver-polished": "linear-gradient(135deg, #e8e8e8, #a8a8a8)",
    "yellow-polished": "linear-gradient(135deg, #ffe066, #b8960c)",
    "rose-gold-polished": "linear-gradient(135deg, #f0c0a0, #c07840)",
  };


  const currentCategory = categories.find(c => c.name === productDetails?.category);
  const currentSubcategory = subcategories.find(sc => sc.name === productDetails?.subcategory);
  
  // Priority: Subcategory size chart -> Category size chart
  const sizeChartImage = currentSubcategory?.sizeChartImage || currentCategory?.sizeChartImage;

  useEffect(() => {
    // Fetch categories and subcategories to get size charts
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data.categories || []))
      .catch(err => console.error("Error fetching categories:", err));

    fetch("/api/subcategories")
      .then(res => res.json())
      .then(data => setSubcategories(data.subCategories || []))
      .catch(err => console.error("Error fetching subcategories:", err));
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      if (title) {
        try {
          const response = await dispatch(fetchProductDetailsByTitle(title));
          
          if (isMounted && !response.payload?.data) {
            toast({
              title: "Product not found",
              description: "The requested product could not be found.",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          if (isMounted) {
            toast({
              title: "Error",
              description: "Failed to fetch product details.",
              variant: "destructive"
            });
          }
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
      dispatch(setProductDetails());
    };
  }, [title, dispatch]);

  useEffect(() => {
    if (productDetails?.image) {
      setMainImage(productDetails.image);
    }
    if (productDetails?._id) {
      dispatch(getReviews(productDetails._id));
    }
  }, [productDetails, dispatch]);

  function handleQuantityChange(value) {
    setQuantity((prevQuantity) => {
      if (value === "increase" && quantity < productDetails?.totalStock) {
        return prevQuantity + 1;
      }
      if (value === "decrease" && quantity > 1) {
        return prevQuantity - 1;
      }
      return prevQuantity;
    });
  }

  function handleAddToCart(getCurrentProductId, getTotalStock) {
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + quantity > getTotalStock) {
          toast({
            title: `Only ${getTotalStock} quantity can be added for this item`,
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
        quantity: quantity,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id || null));
        toast({
          title: "Product added to cart",
        });
      }
    });
  }

  function handleAddToWishlist(productDetails) {
    if (!user) {
      toast({
        title: "Please log in to add products to your wishlist",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      userId: user.id,
      productId: productDetails._id,
      image: productDetails.image,
      title: productDetails.title,
      description: productDetails.description,
      category: productDetails.category,
      brand: productDetails.brand,
      price: productDetails.price,
      salePrice: productDetails.salePrice,
      weight: productDetails.weight,
      totalStock: productDetails.totalStock,
      averageReview: productDetails.averageReview,
    };

    fetch("/api/wishlist", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            throw new Error(errorData.message || 'Failed to add to wishlist');
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          toast({
            title: "Product added to wishlist",
          });
        } else {
          toast({
            title: data.message || 'Something went wrong',
            variant: 'destructive',
          });
        }
      })
      .catch((error) => {
        console.error('Wishlist error:', error);
        toast({
          title: 'Product is already in your wishlist.',
          variant: 'destructive',
        });
      });
  }

  function handleRatingChange(getRating) {
    setRating(getRating);
  }

  function handleAddReview() {
    if (!user?.id) {
      toast({
        title: "You must be logged in to submit a review.",
        variant: "destructive",
      });
      return;
    }

    dispatch(
      addReview({
        productId: productDetails?._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails?._id));
        toast({
          title: "Review added successfully!",
        });
      } else {
        toast({
          title: "Failed to add review",
          variant: "destructive",
        });
      }
    }).catch((error) => {
      console.error("Error submitting review:", error);
      toast({
        title: "An error occurred while adding review",
        variant: "destructive",
      });
    });
  }

  const convertPrice = (price) => {
    if (!exchangeRates || !currency || !exchangeRates[currency]) {
      return price;
    }
    return (price * exchangeRates[currency]).toFixed(2);
  };

  return (
    <div className="w-full bg-rosh-background text-rosh-primary min-h-screen flex flex-col font-sans">
      <ShoppingHeader />

      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[50vh]">
          <p className="font-serif text-2xl animate-pulse">Discovering details...</p>
        </div>
      ) : productDetails ? (
        <main className="w-full">
          {/* Main Content Area */}
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12 flex flex-col lg:flex-row gap-8 lg:gap-16 w-full justify-center">
            
            {/* Left: Product Images */}
            <div className="w-full lg:w-[40%] max-w-[500px] mx-auto lg:mx-0 flex flex-col gap-6 lg:sticky lg:top-32 h-max">
              {/* Main Image Container */}
              <div className="aspect-[4/5] md:aspect-square w-full rounded-sm overflow-hidden bg-white/40 border border-rosh-primary/5 flex items-center justify-center relative group cursor-crosshair">
                {mainImage === "__video__" && productDetails?.video ? (
                  <video
                    src={productDetails.video}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={mainImage}
                    alt={productDetails?.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-[1.03]"
                  />
                )}
              </div>

              {/* Sub-images Row */}
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {/* Main image thumbnail */}
                <img
                  src={productDetails?.image}
                  alt="main thumbnail"
                  className={`w-20 h-24 sm:w-24 sm:h-32 snap-start flex-shrink-0 object-cover cursor-pointer transition-all duration-300 hover:opacity-100 ${
                    mainImage === productDetails?.image ? "border-b-2 border-rosh-primary opacity-100" : "opacity-60 border-b-2 border-transparent"
                  }`}
                  onClick={() => setMainImage(productDetails.image)}
                />
                
                {/* Sub-image thumbnails */}
                {productDetails?.subImages?.map((subImage, index) => (
                  <img
                    key={index}
                    src={subImage}
                    alt={`sub-image-${index}`}
                    className={`w-20 h-24 sm:w-24 sm:h-32 snap-start flex-shrink-0 object-cover cursor-pointer transition-all duration-300 hover:opacity-100 ${
                      mainImage === subImage ? "border-b-2 border-rosh-primary opacity-100" : "opacity-60 border-b-2 border-transparent"
                    }`}
                    onClick={() => setMainImage(subImage)}
                  />
                ))}
                
                {/* Video thumbnail */}
                {productDetails?.video && (
                  <div
                    onClick={() => setMainImage("__video__")}
                    className={`w-20 h-24 sm:w-24 sm:h-32 snap-start flex-shrink-0 cursor-pointer transition-all duration-300 bg-black/80 flex flex-col items-center justify-center relative hover:opacity-100 ${
                      mainImage === "__video__" ? "border-b-2 border-rosh-primary opacity-100" : "opacity-70 border-b-2 border-transparent"
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-8 h-8 mb-2">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span className="text-white text-[10px] font-sans tracking-widest">VIDEO</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Product Details Flow */}
            <div className="w-full lg:w-[55%] flex flex-col pt-1 lg:pl-6">
              {/* Title & Price Flow */}
              <h1 className="font-serif text-xl md:text-2xl font-normal tracking-wide mb-1 leading-snug">
                {productDetails?.title}
              </h1>
              
              <div className="flex items-end gap-3 mb-2">
                <span className="text-lg md:text-xl font-sans font-medium tracking-wide">
                  {currency} {convertPrice(productDetails?.price)}
                </span>
                {productDetails?.salePrice > 0 && (
                  <span className="text-sm md:text-base line-through text-rosh-primary/40 mb-[1px]">
                    {currency} {convertPrice(productDetails?.salePrice)}
                  </span>
                )}
              </div>

              {/* Review Stars Summary */}
              {reviews?.length > 0 && (
                <div 
                  className="flex items-center gap-2 mb-6 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setOpenAccordion("reviews")}
                >
                  <div className="flex items-center gap-0.5">
                    <StarRatingComponent rating={averageReview} />
                  </div>
                  <span className="text-rosh-primary/60 text-xs tracking-wider">
                    ({averageReview.toFixed(1)}) • {reviews.length} Review{reviews.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* Minimal Trust Badges under Price */}
              <div className="flex flex-wrap items-center gap-4 text-xs tracking-widest uppercase text-rosh-primary/60 mb-6 border-b border-rosh-primary/10 pb-6">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Authenticity Guaranteed</span>
                <span className="w-1 h-1 rounded-full bg-rosh-primary/20"></span>
                <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Insured Shipping</span>
              </div>

              <p className="text-rosh-primary/80 text-[15px] font-light mb-6 leading-relaxed max-w-xl">
                {productDetails?.description}
              </p>

              {sizeChartImage && (
                <div className="mb-6">
                  <Button 
                    variant="link" 
                    className="text-rosh-primary uppercase tracking-widest text-xs p-0 h-auto font-medium flex items-center gap-1.5"
                    onClick={() => setSizeChartOpen(true)}
                  >
                    <Ruler className="w-3.5 h-3.5" /> Size Chart
                  </Button>
                </div>
              )}

              {/* Color Variations */}
              {productDetails?.colors && productDetails.colors.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs tracking-widest uppercase text-rosh-primary/60 mb-3">
                    Color: <span className="font-medium text-rosh-primary">{selectedColor ? COLOR_LABELS[selectedColor] ?? selectedColor : "Select"}</span>
                  </p>
                  <div className="flex gap-4 flex-wrap">
                    {productDetails.colors.map((colorId) => {
                      const colorImage = productDetails.colorImages?.find(ci => ci.color === colorId)?.image;
                      const isActive = selectedColor === colorId;
                      return (
                        <button
                          key={colorId}
                          type="button"
                          title={COLOR_LABELS[colorId] ?? colorId}
                          className={`w-5 h-5 rounded-full transition-all duration-300 shadow-sm focus:outline-none hover:scale-110 ${
                            isActive
                              ? "ring-1 ring-rosh-primary ring-offset-2 ring-offset-rosh-background scale-110"
                              : "border border-rosh-primary/10"
                          }`}
                          style={{ background: COLOR_SWATCHES[colorId] ?? "#ccc" }}
                          onClick={() => {
                            setSelectedColor(colorId);
                            if (colorImage) setMainImage(colorImage);
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions: Quantity & Buttons */}
              <div className="flex flex-col gap-4 mt-2 mb-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Quantity Selector */}
                  <div className="flex items-center border border-rosh-primary/20 rounded-none h-10 w-32 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange("decrease")}
                      disabled={quantity === 1}
                      className="flex-1 h-full text-xl hover:bg-rosh-primary/5 transition-colors disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-medium">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange("increase")}
                      disabled={quantity === productDetails?.totalStock}
                      className="flex-1 h-full text-xl hover:bg-rosh-primary/5 transition-colors disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  {productDetails?.totalStock === 0 ? (
                    <Button className="flex-1 h-10 rounded-none bg-rosh-primary/50 text-rosh-background font-sans tracking-widest uppercase cursor-not-allowed hover:bg-rosh-primary/50">
                      Out of Stock
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 h-10 rounded-none bg-rosh-primary text-rosh-background hover:bg-rosh-accent hover:scale-[1.01] transition-all duration-300 font-sans tracking-widest uppercase text-sm"
                      onClick={() =>
                        handleAddToCart(productDetails?._id, productDetails?.totalStock)
                      }
                    >
                      Add to Cart
                    </Button>
                  )}
                </div>

                {/* Wishlist Button - Full Width Below */}
                <Button
                  variant="outline"
                  className="w-full h-10 rounded-none border border-rosh-primary text-rosh-primary hover:bg-rosh-primary/5 transition-all duration-300 font-sans tracking-widest uppercase text-sm flex justify-center items-center gap-2 group"
                  onClick={() => handleAddToWishlist(productDetails)}
                >
                  <Heart className="w-4 h-4 group-hover:fill-rosh-primary/10 transition-all" strokeWidth={1.5} />
                  Add to Wishlist
                </Button>
              </div>

              {/* Accordions Section */}
              <div className="flex flex-col">
                <AccordionItem 
                  title="Product Specifications" 
                  isOpen={openAccordion === "specifications"}
                  onClick={() => toggleAccordion("specifications")}
                >
                  <div className="grid grid-cols-2 gap-y-4 pt-2">
                    {productDetails?.brand && (
                      <div className="flex flex-col"><span className="text-rosh-primary/50 text-xs uppercase tracking-widest">Brand</span><span className="font-medium">{productDetails.brand}</span></div>
                    )}
                    {productDetails?.metalType && (
                      <div className="flex flex-col"><span className="text-rosh-primary/50 text-xs uppercase tracking-widest">Metal</span><span className="font-medium capitalize">{productDetails.metalType}</span></div>
                    )}
                    {productDetails?.purity && (
                      <div className="flex flex-col"><span className="text-rosh-primary/50 text-xs uppercase tracking-widest">Purity</span><span className="font-medium">{productDetails.purity}</span></div>
                    )}
                    <div className="flex flex-col"><span className="text-rosh-primary/50 text-xs uppercase tracking-widest">Weight</span><span className="font-medium">{productDetails?.gramWeight > 0 ? `${productDetails.gramWeight} g` : `${productDetails?.weight || 0} kg`}</span></div>
                    
                    {productDetails?.diamondType && productDetails.diamondType !== "without-diamond" && (
                      <>
                        <div className="flex flex-col"><span className="text-rosh-primary/50 text-xs uppercase tracking-widest">Diamond</span><span className="font-medium">{productDetails.diamondType === 'lab-grown' ? 'Lab Grown' : 'Natural'}</span></div>
                        {productDetails?.diamondCarat > 0 && (
                          <div className="flex flex-col"><span className="text-rosh-primary/50 text-xs uppercase tracking-widest">Carat</span><span className="font-medium">{productDetails.diamondCarat} ct</span></div>
                        )}
                      </>
                    )}
                  </div>
                </AccordionItem>

                <AccordionItem 
                  title="Shipping & Delivery" 
                  isOpen={openAccordion === "shipping"}
                  onClick={() => toggleAccordion("shipping")}
                >
                  <div className="pt-2">
                    <p>Once you place your order, we start working on it right away! The type of product(s) you ordered will determine how long it takes to ship. For example, stock in-hand will be dispatched on the same or next business day. A product getting freshly manufactured typically takes 7-10 business days.</p>
                  </div>
                </AccordionItem>

                <AccordionItem 
                  title="Returns & Exchanges" 
                  isOpen={openAccordion === "returns"}
                  onClick={() => toggleAccordion("returns")}
                >
                  <div className="pt-2">
                    <p>Rosh Fine Jewellery DOES NOT ACCEPT RETURNS OR ISSUE REFUNDS FOR ANY REASON, however we do allow exchange within 7 days of the delivery date. In the event you are dissatisfied with your item for any reason, we will allow you to exchange your item for an item of equal or greater value. Please give us a call and we will provide you with instructions on completing your exchange.</p>
                  </div>
                </AccordionItem>

                <AccordionItem 
                  title="Customer Reviews" 
                  isOpen={openAccordion === "reviews"}
                  onClick={() => toggleAccordion("reviews")}
                >
                  <div className="pt-4 flex flex-col gap-6">
                    {/* Reviews List */}
                    <div className="flex flex-col gap-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                      {reviews && reviews.length > 0 ? (
                        reviews.map((reviewItem) => (
                          <div className="flex gap-4" key={reviewItem._id}>
                            <Avatar className="w-10 h-10 border border-rosh-primary/10 rounded-full flex items-center justify-center bg-rosh-primary/5">
                              <AvatarFallback className="text-rosh-primary font-serif">
                                {reviewItem?.userName[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-1">
                              <h3 className="font-medium text-sm tracking-wide">{reviewItem?.userName}</h3>
                              <div className="flex items-center gap-0.5">
                                <StarRatingComponent rating={reviewItem?.reviewValue} />
                              </div>
                              <p className="text-rosh-primary/70 text-sm mt-1">
                                {reviewItem.reviewMessage}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-rosh-primary/50 text-sm italic">No reviews yet. Be the first to review this product!</p>
                      )}
                    </div>

                    {/* Write a Review */}
                    <div className="mt-4 flex flex-col gap-4 border-t border-rosh-primary/10 pt-6">
                      <Label className="text-sm uppercase tracking-widest text-rosh-primary">Write a Review</Label>
                      <div className="flex gap-1">
                        <StarRatingComponent
                          rating={rating}
                          handleRatingChange={handleRatingChange}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Input
                          name="reviewMsg"
                          value={reviewMsg}
                          onChange={(event) => setReviewMsg(event.target.value)}
                          placeholder="Share your thoughts..."
                          className="rounded-none border-rosh-primary/20 focus-visible:ring-0 focus-visible:border-rosh-primary"
                        />
                        <Button
                          onClick={handleAddReview}
                          disabled={reviewMsg.trim() === "" || rating === 0}
                          className="rounded-none bg-rosh-primary text-rosh-background uppercase tracking-widest text-xs hover:bg-rosh-accent hover:text-rosh-background transition-colors"
                        >
                          Submit
                        </Button>
                      </div>
                    </div>
                  </div>
                </AccordionItem>
              </div>

            </div>
          </div>

          <SimilarProducts 
            category={productDetails?.category} 
            currentProductId={productDetails?._id}
            handleAddtoCart={handleAddToCart}
          />
        </main>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="font-serif text-2xl">Product not found.</p>
        </div>
      )}

      <GoogleReviewsSection />
      <Footer />

      {/* Size Chart Dialog */}
      <Dialog open={sizeChartOpen} onOpenChange={setSizeChartOpen}>
        <DialogContent className="max-w-fit p-0 border-none shadow-none bg-transparent [&>button]:hidden">
          <div className="size-guide-content relative bg-white" bis_skin_checked="1">
            <span 
              id="close-size-guide" 
              className="absolute top-2 right-4 text-4xl cursor-pointer text-gray-500 hover:text-black z-10 leading-none"
              onClick={() => setSizeChartOpen(false)}
            >
              &times;
            </span>
            {sizeChartImage && (
              <img src={sizeChartImage} alt="Size Chart" className="w-auto h-auto max-h-[90vh] block object-contain" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProductDetailsPage;