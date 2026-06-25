import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Search } from "lucide-react";

function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) {
      toast({
        title: "Error",
        description: "Please enter an order ID",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/shop/order/${orderId}`);
      const data = await response.json();

      if (data.success) {
        setOrderDetails(data.data);
      } else {
        toast({
          title: "Error",
          description: data.message || "Order not found",
          variant: "destructive",
        });
        setOrderDetails(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive",
      });
      setOrderDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gray-50">
      <Card className="w-full max-w-xl shadow-xl rounded-2xl p-6">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold">Track Your Order</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTrackOrder} className="space-y-6">
            <div>
              <Label htmlFor="orderId" className="text-base font-medium">
                Order ID
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="orderId"
                  placeholder="Enter your order ID"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Tracking...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Track
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>

          {orderDetails && (
            <div className="mt-8">
              <Separator className="mb-6" />
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="flex flex-col gap-4 text-sm">
                <div className="flex justify-between">
                  <Label>Order Status</Label>
                  <Badge
                    className={`px-3 py-1 capitalize ${
                      orderDetails.orderStatus === "confirmed"
                        ? "bg-green-500"
                        : orderDetails.orderStatus === "rejected"
                        ? "bg-red-600"
                        : "bg-gray-700"
                    }`}
                  >
                    {orderDetails.orderStatus}
                  </Badge>
                </div>

                <div className="flex justify-between">
                  <Label>Payment Status</Label>
                  <Badge
                    className={`px-3 py-1 capitalize ${
                      orderDetails.paymentStatus === "paid"
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                  >
                    {orderDetails.paymentStatus}
                  </Badge>
                </div>

                <div className="flex justify-between">
                  <Label>Order Date</Label>
                  <span>{orderDetails.orderDate.split("T")[0]}</span>
                </div>

                <div className="flex justify-between">
                  <Label>Last Updated</Label>
                  <span>
                    {orderDetails.orderUpdateDate
                      ? orderDetails.orderUpdateDate.split("T")[0]
                      : "N/A"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <Label>Total Amount</Label>
                  <span>{orderDetails.totalAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <Label>Order ID</Label>
                  <span className="break-all">{orderDetails._id}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TrackOrder;
