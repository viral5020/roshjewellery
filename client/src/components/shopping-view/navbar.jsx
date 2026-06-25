import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getSearchResults,
  resetSearchResults,
} from "@/store/shop/search-slice";
import {
  AiOutlineSearch,
  AiOutlineShoppingCart,
  AiOutlineHeart,
  AiOutlineGlobal,
  AiOutlinePhone,
  AiOutlineMenu,
} from "react-icons/ai";
import { FaTrophy } from "react-icons/fa";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { FiUser } from "react-icons/fi";
import { logoutUser } from "@/store/auth-slice";
import { fetchCartItems } from "@/store/shop/cart-slice";
import UserCartWrapper from "./cart-wrapper";
import img from "../../assets/textile-logo.svg";
import { Sheet, SheetTrigger, SheetContent } from "../ui/sheet";
import {
  setCurrency,
  selectCurrency,
  selectExchangeRates,
} from "@/store/shop/currency-slice";
import { shoppingViewHeaderMenuItems as staticMenuItems } from "@/config";

function ShoppingHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([...staticMenuItems]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { searchResults } = useSelector((state) => state.shopSearch);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const selectedCurrency = useSelector(selectCurrency);
  const exchangeRates = useSelector(selectExchangeRates);

  useEffect(() => {
    const interval = setInterval(() => {
      if (staticMenuItems.length !== menuItems.length) {
        setMenuItems([...staticMenuItems]);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [menuItems]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user.id));
    }
  }, [dispatch, user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setAccountDropdownOpen(false);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      dispatch(getSearchResults(query.trim()));
      navigate(`/shop/search?q=${query.trim()}`);
    } else {
      dispatch(resetSearchResults());
      navigate("/shop");
    }
  };

  const handleCurrencyChange = (event) => {
    dispatch(setCurrency(event.target.value));
  };

  const handleNavigate = (menuItem) => {
    navigate(menuItem.path);
    setAccountDropdownOpen(false);
    setMobileMenuOpen(false); // Close menu on mobile
  };

  const [searchParams] = useSearchParams();
  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
      dispatch(getSearchResults(query));
    }
  }, [searchParams, dispatch]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex flex-col">
        {/* Top Bar */}
        <div className="flex justify-between items-center bg-gray-200 py-2 px-4 text-sm">
          <div className="flex items-center gap-2">
            <AiOutlinePhone className="text-green-600" size={20} />
            <span className="text-black-600 font-bold">
              <a href="tel:+911452896547" className="hover:underline">+91 1452896547</a> / 
              <a href="tel:+911452896547" className="hover:underline ml-1">+91 1452896547</a>
            </span>
          </div>
          <span>
            <FaTrophy className="inline-block mr-1 text-yellow-500" size={16} />
            +10 Years of Excellence |
            <AiOutlineGlobal className="inline-block mx-1 text-gray-600" size={16} />
            Worldwide Shipping
          </span>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block">Shipping Rate | COD Check | Help</span>
            <select
              value={selectedCurrency}
              onChange={handleCurrencyChange}
              className="p-1 border rounded-md text-sm"
            >
              {Object.keys(exchangeRates).map((currencyCode) => (
                <option key={currencyCode} value={currencyCode}>
                  {currencyCode}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Logo / Search / Icons */}
        <div className="flex items-center justify-between py-3 px-4 bg-white shadow-md">
          <div className="flex items-center gap-2">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <AiOutlineMenu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[260px]">
                <h2 className="font-bold text-lg mb-4">Categories</h2>
                <div className="flex flex-col gap-2">
                  {menuItems.map((menuItem) => (
                    <Button
                      key={menuItem.id}
                      variant="ghost"
                      className="justify-start"
                      onClick={() => handleNavigate(menuItem)}
                    >
                      {menuItem.label}
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            <Link to="/shop/home" className="flex items-center gap-2">
              <img src={img} alt="Logo" className="h-12" />
            </Link>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="hidden sm:block relative w-[400px]">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full py-2 pl-3 pr-10 border rounded-md placeholder-gray-500"
              placeholder="Search products..."
            />
            <AiOutlineSearch
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              size={20}
            />
          </form>

          <div className="flex gap-2 items-center">
            <Button variant="outline" size="icon" onClick={() => navigate("/shop/wishlist")}>
              <AiOutlineHeart className="w-6 h-6" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setOpenCartSheet(true)}
              className="relative"
            >
              <AiOutlineShoppingCart className="w-6 h-6" />
              <span className="absolute top-[-5px] right-[2px] font-bold text-sm">
                {cartItems?.items?.length || 0}
              </span>
            </Button>

            <DropdownMenu open={accountDropdownOpen} onOpenChange={setAccountDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <FiUser className="w-6 h-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                {user ? (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/shop/account")}>
                      My Account
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={() => navigate("/auth/login")}>
                    Login
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Cart Sheet */}
        <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
          <SheetTrigger />
          <SheetContent side="right">
            <UserCartWrapper
              setOpenCartSheet={setOpenCartSheet}
              cartItems={cartItems?.items || []}
            />
          </SheetContent>
        </Sheet>

        {/* Category Nav (Desktop Only) */}
        <div className="hidden sm:flex flex-wrap gap-6 bg-gray-100 py-3 px-4 text-sm">
          {menuItems.map((menuItem) => (
            <div
              key={menuItem.id}
              onClick={() => handleNavigate(menuItem)}
              className="cursor-pointer hover:bg-gray-300 py-1 px-2 rounded"
            >
              {menuItem.label}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;
