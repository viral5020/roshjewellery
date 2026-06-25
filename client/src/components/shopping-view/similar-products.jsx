import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ShoppingProductTile from "./product-tile";
import { selectCurrency, selectExchangeRates } from "@/store/shop/currency-slice";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";
import { ChevronLeft, ChevronRight } from "lucide-react";

function SimilarProducts({ category, currentProductId, handleAddtoCart }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productList } = useSelector((state) => state.shopProducts);
  const currency = useSelector(selectCurrency);
  const exchangeRates = useSelector(selectExchangeRates);
  const sliderRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    if (!productList || productList.length === 0) {
      dispatch(
        fetchAllFilteredProducts({
          filterParams: {},
          sortParams: "price-lowtohigh",
        })
      );
    }
  }, [dispatch, productList]);

  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  const scrollSlider = (dir) => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: dir === 'left' ? -350 : 350,
        behavior: 'smooth'
      });
    }
  };

  const handleGetProductDetails = (productTitle) => {
    navigate(`/product-details/${productTitle}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!productList || productList.length === 0) return null;

  const similarProducts = productList.filter(
    (product) => product.category === category && product._id !== currentProductId
  ).slice(0, 10);

  if (similarProducts.length === 0) return null;

  return (
    <div className="w-full mt-6 mb-16 px-4 md:px-8 lg:px-12 max-w-[1500px] mx-auto">
      <div className="border-t border-rosh-primary/10 pt-12">
        <h2 className="font-serif text-3xl md:text-4xl mb-8 uppercase tracking-wide">You May Also Like</h2>
        
        <div className="relative group/slider">
          {canScrollLeft && (
            <button 
              onClick={() => scrollSlider('left')}
              className="absolute left-2 top-[40%] -translate-y-1/2 z-10 w-10 h-10 bg-rosh-background/90 text-rosh-primary flex items-center justify-center rounded-full opacity-100 md:opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 hover:bg-rosh-primary hover:text-rosh-background shadow-md border border-rosh-primary/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          
          {canScrollRight && (
            <button 
              onClick={() => scrollSlider('right')}
              className="absolute right-2 top-[40%] -translate-y-1/2 z-10 w-10 h-10 bg-rosh-background/90 text-rosh-primary flex items-center justify-center rounded-full opacity-100 md:opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 hover:bg-rosh-primary hover:text-rosh-background shadow-md border border-rosh-primary/10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          <div 
            ref={sliderRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto gap-4 md:gap-8 snap-x snap-mandatory hide-scrollbar scroll-smooth pb-8"
          >
            {similarProducts.map((product) => (
              <div key={product._id} className="shrink-0 w-[240px] md:w-[280px] snap-start">
                <ShoppingProductTile
                  product={product}
                  handleGetProductDetails={handleGetProductDetails}
                  handleAddtoCart={handleAddtoCart}
                  currency={currency}
                  exchangeRates={exchangeRates}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}

export default SimilarProducts;
