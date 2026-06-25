import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderDetails = location.state?.orderDetails;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-3xl font-bold text-gray-900">Order Placed Successfully!</h2>
            <p className="mt-2 text-lg text-gray-600">
              Thank you for your purchase. Your order has been received.
            </p>
          </div>

          {orderDetails && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-xl font-semibold mb-4">Order Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Order Number</p>
                    <p className="mt-1">{orderDetails._id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Order Date</p>
                    <p className="mt-1">{new Date(orderDetails.orderDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Shipping Address</p>
                  <p className="mt-1">
                    {orderDetails.shippingAddress.address}<br />
                    {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.pincode}<br />
                    Phone: {orderDetails.shippingAddress.phone}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Method</p>
                  <p className="mt-1 capitalize">{orderDetails.paymentMethod}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Total Amount</p>
                  <p className="mt-1">₹{orderDetails.totalAmount}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-center space-x-4">
            <Button
              onClick={() => navigate("/shop/home")}
              variant="outline"
            >
              Continue Shopping
            </Button>
            <Button
                onClick={() => navigate("/shop/account/orders")}
              >
                Track Orders
              </Button>
            {!orderDetails?.isGuestOrder && (
              <Button
                onClick={() => navigate("/shop/account/orders")}
              >
                View Orders
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess; 