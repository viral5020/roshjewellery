import { Menu, ShoppingCart, UserCog, LogOut, Search, Heart, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import UserCartWrapper from "./cart-wrapper";
import { useEffect, useState } from "react";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { setCurrency, selectCurrency, selectExchangeRates } from "@/store/shop/currency-slice";
import roshLogo from "../../assets/Lockup - White Bckg.svg";

const luxuryNavLinks = [
  { id: 'Men', label: 'Men', path: '/shop/Men' },
  { id: 'Women', label: 'Women', path: '/shop/Women' },
  { id: 'collections', label: 'Collections', path: '/shop/listing' },
  { id: 'about', label: 'About Us', path: '/shop/home#about' },
  { id: 'custom', label: 'Custom', path: '/shop/custom' },
];

function ShoppingHeader() {
  const selectedCurrency = useSelector(selectCurrency);
  const exchangeRates = useSelector(selectExchangeRates);
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);

  const [openCartSheet, setOpenCartSheet] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCartItems(user?.id));

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [dispatch, user?.id]);

  function handleLogout() {
    dispatch(logoutUser());
  }

  const handleCurrencyChange = (event) => {
    const newCurrency = event.target.value;
    dispatch(setCurrency(newCurrency));
  };

  function handleNavigate(menuItem) {
    if (menuItem.id === 'about') {
      sessionStorage.removeItem("filters");
      if (window.location.pathname === '/shop/home') {
        const element = document.getElementById('about');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else {
          navigate(menuItem.path);
        }
      } else {
        navigate(menuItem.path);
      }
      return;
    }

    if (menuItem.id === 'custom' || menuItem.id === 'collections') {
      sessionStorage.removeItem("filters");
      navigate(menuItem.path);
      return;
    }

    sessionStorage.removeItem("filters");
    navigate(menuItem.path);
  }

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col">

      {/* Main Navigation */}
      <div
        className={`w-full transition-all duration-500 border-b border-rosh-primary/10 ${isScrolled
            ? "bg-rosh-background"
            : "bg-rosh-background/90 backdrop-blur-md"
          }`}
      >
        <div className="flex h-16 md:h-20 items-center justify-between px-4 lg:px-12 max-w-[1600px] mx-auto w-full">

          {/* LEFT: Hamburger (Mobile) & Logo (Desktop) */}
          <div className="flex flex-1 items-center justify-start">
            <div className="lg:hidden flex items-center">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-rosh-primary hover:bg-rosh-primary/5">
                    <Menu className="h-6 w-6" strokeWidth={1.5} />
                    <span className="sr-only">Toggle header menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] bg-rosh-background border-r-rosh-primary/10 text-rosh-primary p-0">
                  <div className="flex flex-col h-full py-8 px-6">
                    {/* Mobile Logo inside Drawer */}
                    <div className="mb-12 flex flex-col items-center">
                      <img src={roshLogo} alt="Rosh Fine Jewellery" className="h-10 w-auto scale-[2]" />
                    </div>

                    <nav className="flex flex-col gap-6 font-sans font-medium tracking-widest text-sm uppercase">
                      {luxuryNavLinks.map((menuItem) => (
                        <SheetClose asChild key={menuItem.id}>
                          <span
                            onClick={() => handleNavigate(menuItem)}
                            className="cursor-pointer hover:text-rosh-accent transition-colors pb-2 border-b border-rosh-primary/10"
                          >
                            {menuItem.label}
                          </span>
                        </SheetClose>
                      ))}
                    </nav>

                    <div className="mt-auto flex flex-col gap-6">
                      {/* Mobile User Auth / Account Info */}
                      <div className="flex flex-col gap-4 border-t border-rosh-primary/10 pt-6">
                        {user ? (
                          <>
                            <SheetClose asChild>
                              <span
                                onClick={() => navigate("/shop/account")}
                                className="cursor-pointer hover:text-rosh-accent transition-colors text-sm uppercase tracking-widest"
                              >
                                My Account
                              </span>
                            </SheetClose>
                            <SheetClose asChild>
                              <span
                                onClick={handleLogout}
                                className="cursor-pointer hover:text-rosh-accent transition-colors text-sm uppercase tracking-widest text-red-900"
                              >
                                Sign Out
                              </span>
                            </SheetClose>
                          </>
                        ) : (
                          <SheetClose asChild>
                            <span
                              onClick={() => navigate("/auth/login")}
                              className="cursor-pointer hover:text-rosh-accent transition-colors text-sm uppercase tracking-widest"
                            >
                              Sign In
                            </span>
                          </SheetClose>
                        )}
                      </div>

                      {/* Currency Selector Mobile */}
                      <div className="flex items-center justify-between border-t border-rosh-primary/10 pt-6">
                        <span className="text-xs tracking-widest uppercase text-rosh-primary/50">Currency</span>
                        <div className="relative flex items-center">
                          <select
                            value={selectedCurrency}
                            onChange={handleCurrencyChange}
                            className="bg-transparent border-none text-sm outline-none text-rosh-accent focus:ring-0 cursor-pointer text-right p-0 pr-5 appearance-none"
                          >
                            {Object.keys(exchangeRates).map((currencyCode) => (
                              <option key={currencyCode} value={currencyCode} className="text-rosh-primary">
                                {currencyCode}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-rosh-accent" strokeWidth={1.5} />
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Logo */}
            <Link to="/shop/home" className="hidden lg:flex items-center">
              <img src={roshLogo} alt="Rosh Fine Jewellery" className="h-[46px] w-auto scale-[2.5] origin-left" />
            </Link>
          </div>

          {/* CENTER: Logo (Mobile) & Nav Links (Desktop) */}
          <div className="flex flex-1 items-center justify-center">
            {/* Mobile Logo */}
            <Link to="/shop/home" className="lg:hidden flex flex-col items-center justify-center">
              <img src={roshLogo} alt="Rosh Fine Jewellery" className="h-10 w-auto scale-[2]" />
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center justify-center gap-8 font-sans font-medium tracking-[0.15em] text-xs uppercase text-rosh-primary">
              {luxuryNavLinks.map((menuItem) => (
                <span
                  onClick={() => handleNavigate(menuItem)}
                  className="cursor-pointer relative group py-2 hover:text-rosh-accent transition-colors"
                  key={menuItem.id}
                >
                  {menuItem.label}
                  <span className="absolute left-0 bottom-0 w-full h-[1px] bg-rosh-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </span>
              ))}
            </nav>
          </div>

          {/* RIGHT: Utility Icons */}
          <div className="flex flex-1 items-center justify-end gap-3 lg:gap-6 text-rosh-primary">
            {/* Desktop Currency */}
            <div className="hidden lg:flex items-center text-xs tracking-widest mr-2 border-r border-rosh-primary/20 pr-4 relative">
              <select
                value={selectedCurrency}
                onChange={handleCurrencyChange}
                className="bg-transparent border-none outline-none text-rosh-primary hover:text-rosh-accent transition-colors focus:ring-0 cursor-pointer appearance-none px-2 pr-6"
              >
                {Object.keys(exchangeRates).map((currencyCode) => (
                  <option key={currencyCode} value={currencyCode} className="text-rosh-primary">
                    {currencyCode}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-rosh-primary" strokeWidth={2} />
            </div>

            <button onClick={() => navigate('/shop/search')} className="hover:text-rosh-accent transition-colors p-1">
              <Search className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
              <span className="sr-only">Search</span>
            </button>

            <button onClick={() => navigate('/shop/wishlist')} className="hover:text-rosh-accent transition-colors p-1">
              <Heart className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
              <span className="sr-only">Wishlist</span>
            </button>

            <Sheet open={openCartSheet} onOpenChange={() => setOpenCartSheet(false)}>
              <button
                onClick={() => setOpenCartSheet(true)}
                className="relative hover:text-rosh-accent transition-colors p-1"
              >
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rosh-primary text-[9px] font-bold text-rosh-background">
                  {cartItems?.items?.length || 0}
                </span>
                <span className="sr-only">User cart</span>
              </button>
              <UserCartWrapper
                setOpenCartSheet={setOpenCartSheet}
                cartItems={cartItems?.items || []}
              />
            </Sheet>

            {/* User Avatar Dropdown or Login button */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex hover:opacity-80 transition-opacity ml-2 focus:outline-none">
                    <Avatar className="h-8 w-8 bg-rosh-primary/10 border border-rosh-primary/20">
                      <AvatarFallback className="bg-transparent text-rosh-primary text-xs font-serif font-medium">
                        {user?.userName?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end" className="w-56 mt-4 bg-rosh-background text-rosh-primary border-rosh-primary/10 rounded-none shadow-xl">
                  <DropdownMenuLabel className="font-serif font-normal tracking-wide">
                    Welcome, {user?.userName}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-rosh-primary/10" />
                  <DropdownMenuItem onClick={() => navigate("/shop/account")} className="cursor-pointer focus:bg-rosh-primary/5 focus:text-rosh-primary">
                    <UserCog className="mr-2 h-4 w-4" strokeWidth={1.5} />
                    <span className="tracking-wide text-sm font-light">My Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-rosh-primary/10" />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer focus:bg-rosh-primary/5 focus:text-rosh-primary text-red-900 focus:text-red-900">
                    <LogOut className="mr-2 h-4 w-4" strokeWidth={1.5} />
                    <span className="tracking-wide text-sm font-light">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => navigate("/auth/login")}
                className="hover:text-rosh-accent transition-colors text-[10px] uppercase font-sans font-medium tracking-[0.2em] ml-2 border border-rosh-primary/10 px-3 py-1.5 hover:border-rosh-primary bg-transparent"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;
