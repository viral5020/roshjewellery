import { StarIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent } from "../../components/ui/dialog";
import { Separator } from "../../components/ui/separator";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "../../components/ui/use-toast";
import { setProductDetails } from "@/store/shop/products-slice";
import { Label } from "../../components/ui/label";
import StarRatingComponent from "../../components/common/star-rating";
import { useEffect, useState } from "react";
import { addReview, getReviews } from "@/store/shop/review-slice";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);

  const [selectedSize, setSelectedSize] = useState("");

  const { toast } = useToast();

  const getCategoryName = () => {
    const cat = String(productDetails?.category || "").toLowerCase();
    const subcat = String(productDetails?.subcategory || "").toLowerCase();
    
    if (cat.includes("ring") || subcat.includes("ring")) {
      if (!cat.includes("earring") && !cat.includes("earing") && !subcat.includes("earring") && !subcat.includes("earing")) {
        return "rings";
      }
    }
    if (cat.includes("chain") || subcat.includes("chain")) return "chains";
    if (cat.includes("bracelet") || subcat.includes("bracelet")) return "bracelets";
    return null;
  };

  const getSizeOptions = () => {
    const category = getCategoryName();
    if (category === "rings") {
      return Array.from({length: 26}, (_, i) => `${i + 5}mm`);
    } else if (category === "chains") {
      return ["14", "16", "18", "20", "22"].map(s => `${s} inches`);
    } else if (category === "bracelets") {
      return ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5"].map(s => `${s} inches`);
    }
    return null;
  };

  const sizeOptions = getSizeOptions();

  // Handle rating change
  function handleRatingChange(getRating) {
    setRating(getRating);
  }

  // Handle adding product to cart
  function handleAddToCart(getCurrentProductId, getTotalStock) {
    if (sizeOptions && !selectedSize) {
      toast({
        title: "Please select a size",
        variant: "destructive",
      });
      return;
    }

    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId && item.size === selectedSize
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
        size: selectedSize || undefined,
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

  function handleDialogClose() {
    setOpen(false);
    dispatch(setProductDetails());
    setRating(0);
    setReviewMsg("");
    setSelectedSize("");
  }

  // Handle adding review
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
      // Debugging: Check if the data response is valid and contains 'success'
      console.log(data, "Add Review Response");

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

  // Fetch reviews when the product changes
  useEffect(() => {
    if (productDetails !== null) dispatch(getReviews(productDetails?._id));
  }, [productDetails]);

  console.log(reviews, "reviews");

  // Calculate average review rating
  const reviewsList = reviews || [];
  const averageReview =
    reviewsList.length > 0
      ? reviewsList.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) / reviewsList.length
      : 0;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="grid grid-cols-2 gap-8 sm:p-12 max-w-[90vw] sm:max-w-[80vw] lg:max-w-[70vw]">
        <div className="relative overflow-hidden rounded-lg flex flex-col gap-4">
          <img
            src={productDetails?.image}
            alt={productDetails?.title}
            width={600}
            height={600}
            className="aspect-square w-full object-cover"
          />
          {productDetails?.video && (
            <div className="rounded-lg overflow-hidden bg-black">
              <video
                src={productDetails.video}
                controls
                className="w-full max-h-64 object-contain"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
        <div className="">
          <div>
            <h1 className="text-3xl font-extrabold">{productDetails?.title}</h1>
            <p className="text-muted-foreground text-xl mb-5 mt-4">
              {productDetails?.description}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2 mb-6 text-sm bg-muted/30 p-4 rounded-lg">
            {productDetails?.metalType && (
              <div className="flex flex-col">
                <span className="text-muted-foreground font-medium">Metal Type</span>
                <span className="font-semibold">{productDetails.metalType.charAt(0).toUpperCase() + productDetails.metalType.slice(1)}</span>
              </div>
            )}
            {productDetails?.purity && (
              <div className="flex flex-col">
                <span className="text-muted-foreground font-medium">Purity</span>
                <span className="font-semibold">{productDetails.purity}</span>
              </div>
            )}
            {productDetails?.gramWeight > 0 && (
              <div className="flex flex-col">
                <span className="text-muted-foreground font-medium">Weight</span>
                <span className="font-semibold">{productDetails.gramWeight}g</span>
              </div>
            )}
            {productDetails?.labourCost > 0 && (
              <div className="flex flex-col">
                <span className="text-muted-foreground font-medium">Making/Labour Charges</span>
                <span className="font-semibold">₹{productDetails.labourCost}</span>
              </div>
            )}
            {productDetails?.diamondType && productDetails.diamondType !== "without-diamond" && (
              <>
                <div className="flex flex-col">
                  <span className="text-muted-foreground font-medium">Diamond Type</span>
                  <span className="font-semibold">{productDetails.diamondType === 'lab-grown' ? 'Lab Grown' : 'Natural'}</span>
                </div>
                {productDetails?.diamondCarat > 0 && (
                  <div className="flex flex-col">
                    <span className="text-muted-foreground font-medium">Diamond Carat</span>
                    <span className="font-semibold">{productDetails.diamondCarat} ct</span>
                  </div>
                )}
                {productDetails?.diamondColor && (
                  <div className="flex flex-col">
                    <span className="text-muted-foreground font-medium">Diamond Color</span>
                    <span className="font-semibold">{productDetails.diamondColor}</span>
                  </div>
                )}
                {productDetails?.diamondPrice > 0 && (
                  <div className="flex flex-col">
                    <span className="text-muted-foreground font-medium">Diamond Price</span>
                    <span className="font-semibold">₹{productDetails.diamondPrice}</span>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p
              className={`text-3xl font-bold text-primary ${
                productDetails?.salePrice > 0 ? "line-through" : ""
              }`}
            >
              ₹{productDetails?.price}
            </p>
            {productDetails?.salePrice > 0 ? (
              <p className="text-2xl font-bold text-muted-foreground">
                ₹{productDetails?.salePrice}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-0.5">
              <StarRatingComponent rating={averageReview} />
            </div>
            <span className="text-muted-foreground">
              ({averageReview.toFixed(2)})
            </span>
          </div>

          {sizeOptions && (
            <div className="mt-4">
              <Label className="mb-2 block">Select Size</Label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a size" />
                </SelectTrigger>
                <SelectContent>
                  {sizeOptions.map(size => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="mt-5 mb-5">
            {productDetails?.totalStock === 0 ? (
              <Button className="w-full opacity-60 cursor-not-allowed">
                Out of Stock
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() =>
                  handleAddToCart(
                    productDetails?._id,
                    productDetails?.totalStock
                  )
                }
              >
                Add to Cart
              </Button>
            )}
          </div>
          <Separator />
          <div className="max-h-[300px] overflow-auto">
            <h2 className="text-xl font-bold mb-4">Reviews</h2>
            <div className="grid gap-6">
              {reviewsList.length > 0 ? (
                reviewsList.map((reviewItem) => (
                  <div className="flex gap-4" key={reviewItem._id}>
                    <Avatar className="w-10 h-10 border">
                      <AvatarFallback>
                        {reviewItem?.userName[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{reviewItem?.userName}</h3>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <StarRatingComponent rating={reviewItem?.reviewValue} />
                      </div>
                      <p className="text-muted-foreground">
                        {reviewItem.reviewMessage}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <h1>No Reviews</h1>
              )}
            </div>
            <div className="mt-10 flex-col flex gap-2">
              <Label>Write a review</Label>
              <div className="flex gap-1">
                <StarRatingComponent
                  rating={rating}
                  handleRatingChange={handleRatingChange}
                />
              </div>
              <Input
                name="reviewMsg"
                value={reviewMsg}
                onChange={(event) => setReviewMsg(event.target.value)}
                placeholder="Write a review..."
              />
              <Button
                onClick={handleAddReview}
                disabled={reviewMsg.trim() === ""}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
