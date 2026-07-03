import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import PropTypes from 'prop-types';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
import AdminLayout from "./components/admin-view/layout";
import AuthLayout from "./components/auth/layout";
import ShoppingLayout from "./components/shopping-view/layout";
import AdminCustomer from './pages/admin-view/customer';
import AdminDashboard from "./pages/admin-view/dashboard";
import AdminFeatures from "./pages/admin-view/features";
import AdmingiftCard from "./pages/admin-view/giftCard";
import AdminOrders from "./pages/admin-view/orders";
import AdminProducts from "./pages/admin-view/products";
import AdminSales from './pages/admin-view/sales';
import AuthLogin from "./pages/auth/login";
import AuthRegister from "./pages/auth/register";
import NotFound from "./pages/not-found";
import ShoppingAccount from "./pages/shopping-view/account";
import ShoppingCheckout from "./pages/shopping-view/checkout";
import ShoppingHome from "./pages/shopping-view/home";
import ShoppingListing from "./pages/shopping-view/listing";
import CustomWorkPage from "./pages/shopping-view/custom";
import ContactUs from "./pages/shopping-view/contact";
import FAQPage from "./pages/shopping-view/faq";
import PrivacyPolicy from "./pages/shopping-view/privacy";
import TermsOfService from "./pages/shopping-view/terms";
import RefundPolicy from "./pages/shopping-view/refund";
import PaymentSuccessPage from "./pages/shopping-view/payment-success";
import PaypalReturnPage from "./pages/shopping-view/paypal-return";
import SearchProducts from "./pages/shopping-view/search";
import UnauthPage from "./pages/unauth-page";
import { checkAuth } from "./store/auth-slice";
import ForgotPassword from './pages/auth/forgetpassword';
import ResetPassword from "./pages/auth/resetpassword";
import ProductDetailsPage from "./pages/shopping-view/ProductDetailsPage";
import Category from "./pages/admin-view/category";
import SettingsPage from "./pages/admin-view/setting";
import InvoiceGeneratorPage from './pages/admin-view/InvoiceGeneratorPage';
import AllInvoicesPage from './pages/admin-view/allinvoice';
import InventoryPage from "./pages/admin-view/InventoryPage";
import WishlistPage from './pages/shopping-view/wishlist';
import SubscriberPage from './pages/admin-view/Subscribers';
import SubCategoryPage from "./pages/admin-view/SubCategoryPage";
import TrackOrderPage from "./pages/shopping-view/track-order";
import Report from './pages/admin-view/Report';
import OrderSuccess from "./pages/shopping-view/order-success";
import CustomOrdersPage from "./pages/admin-view/CustomOrders";
import NewArrivals from "./pages/shopping-view/new-arrivals";
import BestSellers from "./pages/shopping-view/best-sellers";

// Protected Route component for authenticated routes
const ProtectedRoute = ({ isAuthenticated, user, children, redirectTo = "/auth/login", requiredRole = null }) => {
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check for role if required
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/shop/home" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  user: PropTypes.object,
  children: PropTypes.node.isRequired,
  redirectTo: PropTypes.string,
  requiredRole: PropTypes.string
};

function App() {
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();

  useEffect(() => {
    // Intercept Google OAuth token from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      // Clean up the URL without reloading the page
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    dispatch(checkAuth());
  }, [dispatch]);

  if (isLoading) return <Skeleton className="w-[800] bg-black h-[600px]" />;

  console.log(isLoading, user);

  return (
    <div className="flex flex-col bg-white">
      <ScrollToTop />
      <Routes>
        {/* Redirect root to shop/home */}
        <Route path="/" element={<Navigate to="/shop/home" replace />} />

        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
          <Route path="forgotpassword" element={<ForgotPassword />} />
          <Route path="resetpassword" element={<ResetPassword />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute 
              isAuthenticated={isAuthenticated} 
              user={user}
              requiredRole="admin"
            >
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="features" element={<AdminFeatures />} />
          <Route path="giftCard" element={<AdmingiftCard />} />
          <Route path="customer" element={<AdminCustomer />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="sales" element={<AdminSales />} />
          <Route path="category" element={<Category />} />
          <Route path="invoice" element={<InvoiceGeneratorPage />} />
          <Route path="allinvoice" element={<AllInvoicesPage />} />
          <Route path="Inventory" element={<InventoryPage />} />
          <Route path="Subscribers" element={<SubscriberPage />} />
          <Route path="/admin/SubCategoryPage" element={<SubCategoryPage />} />
          <Route path="/admin/SubCategoryPage/category/:categoryId" element={<SubCategoryPage />} />
          <Route path="/admin/reports" element={<Report />} />
          <Route path="custom-orders" element={<CustomOrdersPage />} />
        </Route>

        <Route path="/shop" element={<ShoppingLayout />}>
          <Route path="home" element={<ShoppingHome />} />
          <Route path="listing" element={<ShoppingListing />} />
          <Route path="new-arrivals" element={<NewArrivals />} />
          <Route path="best-sellers" element={<BestSellers />} />
          <Route path="custom" element={<CustomWorkPage />} />
          <Route path="contact" element={<ContactUs />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<TermsOfService />} />
          <Route path="refund" element={<RefundPolicy />} />
          <Route path="checkout" element={<ShoppingCheckout />} />
          <Route path="order-success" element={<OrderSuccess />} />
          <Route 
            path="account" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} user={user}>
                <ShoppingAccount />
              </ProtectedRoute>
            }
          />
          <Route path="account/orders" element={<TrackOrderPage />} />
          <Route path="paypal-return" element={<PaypalReturnPage />} />
          <Route path="payment-success" element={<PaymentSuccessPage />} />
          <Route path="search" element={<SearchProducts />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path=":categoryName" element={<ShoppingListing />} />
        </Route>

        <Route path="/unauth-page" element={<UnauthPage />} />
        <Route path="*" element={<NotFound />} />


        <Route path="/product-details/:title" element={<ProductDetailsPage />} />
      </Routes>
    </div>
  );
}

export default App;
