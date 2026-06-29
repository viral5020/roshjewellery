import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import ProductFilter from "@/components/shopping-view/filter";
import ProductDetailsDialog from "@/pages/shopping-view/product-details";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { sortOptions } from "@/config";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import { ArrowUpDownIcon, SlidersHorizontal, ChevronRight, ChevronLeft } from "lucide-react";
import Footer from "@/components/shopping-view/footer";


function createSearchParamsHelper(filterParams) {
  const queryParams = [];

  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      const paramValue = value.join(",");
      queryParams.push(`${key}=${encodeURIComponent(paramValue)}`);
    }
  }

  return queryParams.join("&");
}

function ShoppingListing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categoryName } = useParams(); // ✅ Get category from route
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const { productList } = useSelector((state) => state.shopProducts);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { currency, exchangeRates } = useSelector((state) => state.currency);

  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState("price-lowtohigh");

  // Set default filters on mount (or when categoryName changes)
  // Set default filters on mount (or when categoryName changes)
  useEffect(() => {
    const storedFilters = JSON.parse(sessionStorage.getItem("filters")) || {};
    let freshFilters = { ...storedFilters };
    
    if (categoryName) {
      freshFilters.category = [categoryName];
    } else if (!storedFilters.category) {
      freshFilters.category = [];
    }

    // Read initial subcategories from searchParams if present
    const urlSubcat = searchParams.get("subcategories");
    if (urlSubcat) {
      freshFilters.subcategories = urlSubcat.split(",");
    }

    const isDifferent = JSON.stringify(freshFilters) !== JSON.stringify(filters);
    if (isDifferent) {
      setFilters(freshFilters);
      sessionStorage.setItem("filters", JSON.stringify(freshFilters));
    }
  }, [categoryName, searchParams]);





  // Fetch products based on filters + sort
  useEffect(() => {
    if (filters && Object.keys(filters).length > 0 && sort) {
      const queryString = createSearchParamsHelper(filters);
      setSearchParams(new URLSearchParams(queryString));

      dispatch(
        fetchAllFilteredProducts({
          filterParams: filters,
          sortParams: sort,
        })
      );
    }
  }, [dispatch, filters, sort]);

  // Handle sort dropdown
  function handleSort(value) {
    setSort(value);
  }

  // Handle filter changes
  function handleFilter(getSectionId, getCurrentOption) {
    let cpyFilters = { ...filters };

    if (getSectionId === "price") {
      if (getCurrentOption[1] === 100000 && getCurrentOption[0] === 0) {
        delete cpyFilters[getSectionId];
      } else {
        cpyFilters[getSectionId] = getCurrentOption;
      }
    } else {
      if (!cpyFilters[getSectionId]) {
        cpyFilters[getSectionId] = [getCurrentOption];
      } else {
        const index = cpyFilters[getSectionId].indexOf(getCurrentOption);
        if (index === -1) {
          cpyFilters[getSectionId].push(getCurrentOption);
        } else {
          cpyFilters[getSectionId].splice(index, 1);
        }
      }
    }

    setFilters(cpyFilters);
    sessionStorage.setItem("filters", JSON.stringify(cpyFilters));
  }

  // Navigate to product details
  function handleGetProductDetails(getCurrentProductId) {
    navigate(`/product-details/${getCurrentProductId}`);
  }

  // Add to cart handler
  function handleAddtoCart(getCurrentProductId, getTotalStock) {
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
        userId: user?.id || null,  // Pass null if user is not logged in
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id || null));  // Pass null if user is not logged in
        toast({
          title: "Product is added to cart",
        });
      }
    });
  }

  // Currency conversion helper
  const convertPrice = (price) => {
    if (!exchangeRates || !currency || !exchangeRates[currency]) {
      return price;
    }
    return (price * exchangeRates[currency]).toFixed(2);
  };
  const filterComponent = (
    <ProductFilter 
      filters={filters} 
      handleFilter={handleFilter} 
      selectedCategory={categoryName} 
    />
  );

  const [dbSubcategories, setDbSubcategories] = useState([]);
  useEffect(() => {
    fetch('/api/subcategories')
      .then(res => res.json())
      .then(data => setDbSubcategories(data.subCategories || []))
      .catch(console.error);
  }, []);

  const displayedProductList = productList?.filter(product => {
    let match = true;
    if (filters && filters.subcategories && filters.subcategories.length > 0) {
      const filterValuesLower = filters.subcategories.map(f => String(f).toLowerCase());
      
      let prodSubcat = String(product.subcategory || "").toLowerCase();
      
      // Resolve ID to name if possible
      const subcatObj = dbSubcategories.find(s => s._id === product.subcategory);
      if (subcatObj) {
        prodSubcat = subcatObj.name.toLowerCase();
      }

      // Handle the Earings typo from DB
      if (prodSubcat === "earings") prodSubcat = "earrings";

      const matches = filterValuesLower.some(fv => {
        let fvAdjusted = fv;
        if (fvAdjusted === "earings") fvAdjusted = "earrings";
        
        // Resolve filter ID to name if it's an ID from the sidebar
        const filterSubcatObj = dbSubcategories.find(s => s._id === fv);
        if (filterSubcatObj) {
          let filterName = filterSubcatObj.name.toLowerCase();
          if (filterName === "earings") filterName = "earrings";
          fvAdjusted = filterName;
        }

        return prodSubcat.includes(fvAdjusted) || fvAdjusted.includes(prodSubcat);
      });

      match = match && matches;
    }
    if (filters && filters.price && filters.price.length === 2) {
      const maxPrice = filters.price[1];
      if (maxPrice > 0 && maxPrice < 100000) {
         const currentPrice = product.salePrice > 0 ? product.salePrice : product.price;
         match = match && currentPrice <= maxPrice;
      }
    }
    return match;
  }) || [];

  return (
    <div className="bg-rosh-background md:h-[calc(100vh-80px)] md:overflow-hidden text-rosh-primary font-sans flex flex-col">
      {/* Unified Control Bar */}
      <div className="bg-rosh-background/95 backdrop-blur-md border-b border-rosh-primary/10 w-full shrink-0">
        <div className={`max-w-[1600px] mx-auto px-4 md:px-8 flex items-center justify-between ${categoryName ? 'py-2' : 'py-4'}`}>
          
          {/* Left: Filter Toggle */}
          <div className="flex-1 flex justify-start">
            {/* Filter Toggle has been removed to keep sidebar always open */}
          </div>

          {/* Middle: Title & Count */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h1 className="font-serif text-2xl md:text-3xl text-rosh-primary capitalize m-0 leading-none">
              {categoryName ? categoryName : "Complete Collection"}
            </h1>
            <span className="text-[9px] md:text-[10px] font-light text-rosh-primary/50 tracking-[0.2em] uppercase mt-2">
              {displayedProductList.length} Products
            </span>
          </div>

          {/* Right: Sort */}
          <div className="flex-1 flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 text-[10px] md:text-xs text-rosh-primary tracking-[0.2em] uppercase hover:text-rosh-accent transition-colors duration-300">
                  <span className="hidden sm:inline">Sort By</span>
                  <ArrowUpDownIcon className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[220px] bg-rosh-background border border-rosh-primary/10 rounded-none shadow-xl py-2 z-50">
                <DropdownMenuRadioGroup value={sort} onValueChange={handleSort}>
                  {sortOptions.map((sortItem) => (
                    <DropdownMenuRadioItem 
                      value={sortItem.id} 
                      key={sortItem.id}
                      className="text-[11px] uppercase tracking-widest text-rosh-primary hover:bg-rosh-primary/5 focus:bg-rosh-primary/5 focus:text-rosh-accent cursor-pointer py-3 rounded-none"
                    >
                      {sortItem.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row md:overflow-hidden w-full max-w-[1600px] mx-auto px-4 md:px-8 mt-4 md:mt-6">
        
        {/* Always-open Sidebar */}
        <div 
          className="w-full md:w-[280px] md:shrink-0 md:h-full md:overflow-y-auto custom-scrollbar md:pr-4 md:pb-8 mb-8 md:mb-0 md:mr-10"
        >
          {filterComponent}
        </div>
        
        {/* Product Grid and Footer (Content Section) */}
        <div className="flex-1 w-full min-w-0 md:h-full md:overflow-y-auto custom-scrollbar flex flex-col justify-between">
          <div className="w-full transition-all duration-[600ms] ease-[cubic-bezier(0.25,1,0.5,1)] pb-16">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-6 lg:gap-x-8 gap-y-12 md:gap-y-16">
              {displayedProductList && displayedProductList.length > 0 ? (
                displayedProductList.map((productItem) => (
                  <ShoppingProductTile
                    key={productItem._id}
                    handleGetProductDetails={handleGetProductDetails}
                    product={productItem}
                    handleAddtoCart={handleAddtoCart}
                    currency={currency}
                    exchangeRates={exchangeRates}
                    convertedPrice={convertPrice(productItem.price)}
                    convertedSalePrice={
                      productItem.salePrice > 0
                        ? convertPrice(productItem.salePrice)
                        : null
                    }
                  />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-60">
                  <p className="text-rosh-primary font-serif text-3xl italic mb-4">No pieces discovered.</p>
                  <p className="text-[10px] md:text-xs tracking-[0.2em] uppercase font-light">Please adjust your filters.</p>
                </div>
              )}
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default ShoppingListing;
