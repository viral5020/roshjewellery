import { useState, useEffect } from "react";
import CommonForm from "../common/form";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} from "@/store/admin/order-slice";
import { useToast } from "../ui/use-toast";
import QRCode from "qrcode"; // Import QRCode library
import { jsPDF } from "jspdf"; // Import jsPDF library

const initialFormData = {
  status: "",
};

function AdminOrderDetailsView({ orderDetails }) {
  const [formData, setFormData] = useState(initialFormData);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const [qrCodeUrl, setQrCodeUrl] = useState(""); // State to store the generated QR code URL

  useEffect(() => {
    // Generate the QR code whenever the order details change
    if (orderDetails?._id) {
      // Create a formatted string with both the order ID and total amount
      const orderInfo = `
        ORDER ID - ${orderDetails._id}
        ORDER DATE - ${orderDetails?.orderDate.split("T")[0]}
        TOTAL PAYABLE AMOUNT - ${(orderDetails?.totalAmount + orderDetails?.shippingCharges).toFixed(2)}
        PAYMENT STATUS - ${orderDetails?.paymentStatus}
        ORDER STATUS - ${orderDetails?.orderStatus}

        ITEMS:
        ${orderDetails?.cartItems?.map(item => `- TITLE: ${item.title}${item.size ? ` (Size: ${item.size})` : ''}, QUANTITY: ${item.quantity}, PRICE: ${item.price}`).join("\n")}

        SHIPPING INFO:
        NAME - ${user.userName}
        ADDRESS - ${orderDetails?.addressInfo?.address}
        CITY - ${orderDetails?.addressInfo?.city}
        PINCODE - ${orderDetails?.addressInfo?.pincode}
        PHONE - ${orderDetails?.addressInfo?.phone}
        NOTES - ${orderDetails?.addressInfo?.notes || 'N/A'}
      `;
    
      // Generate the QR code with the formatted string containing both the order ID and total amount
      QRCode.toDataURL(orderInfo, { width: 150 }, (err, url) => {
        if (err) console.error(err);
        setQrCodeUrl(url); // Set the QR code URL in the state
      });
    }
  }, [orderDetails, user.userName]);

  function handleUpdateStatus(event) {
    event.preventDefault();
    const { status } = formData;

    dispatch(
      updateOrderStatus({ id: orderDetails?._id, orderStatus: status })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        setFormData(initialFormData);
        toast({
          title: data?.payload?.message,
        });
      }
    });
  }

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    let yOffset = 20;

    // Add Title
    doc.setFontSize(16);
    doc.text("Order Details", 14, yOffset);
    yOffset += 15;

    // Order Information
    doc.setFontSize(12);
    doc.text(`Order ID: ${orderDetails._id}`, 14, yOffset);
    yOffset += 10;
    doc.text(`Order Date: ${orderDetails?.orderDate.split("T")[0]}`, 14, yOffset);
    yOffset += 10;
    doc.text(`Last Updated: ${orderDetails?.orderUpdateDate ? orderDetails.orderUpdateDate.split("T")[0] : 'N/A'}`, 14, yOffset);
    yOffset += 10;
    doc.text(`Order Price: ${orderDetails?.totalAmount}`, 14, yOffset);
    yOffset += 10;
    doc.text(`Shipping Charges: ${orderDetails?.shippingCharges}`, 14, yOffset);
    yOffset += 10;
    doc.text(`Total Payable Amount: ${(orderDetails?.totalAmount + orderDetails?.shippingCharges).toFixed(2)}`, 14, yOffset);
    yOffset += 10;
    doc.text(`Payment Method: ${orderDetails?.paymentMethod}`, 14, yOffset);
    yOffset += 10;
    doc.text(`Payment Status: ${orderDetails?.paymentStatus}`, 14, yOffset);
    yOffset += 10;
    doc.text(`Payment ID: ${orderDetails?.paymentId || 'N/A'}`, 14, yOffset);
    yOffset += 10;
    doc.text(`Payer ID: ${orderDetails?.payerId || 'N/A'}`, 14, yOffset);
    yOffset += 10;
    doc.text(`Order Status: ${orderDetails?.orderStatus}`, 14, yOffset);
    yOffset += 10;
    doc.text(`Coupon Code: ${orderDetails?.couponCode || 'N/A'}`, 14, yOffset);
    yOffset += 10;
    doc.text(`Discount: $${orderDetails?.discount || 0}`, 14, yOffset);
    yOffset += 10;
    doc.text(`Free Shipping: ${orderDetails?.freeShipping ? 'Yes' : 'No'}`, 14, yOffset);
    yOffset += 10;
    doc.text(`Weight: ${orderDetails?.weight ? `${orderDetails.weight} kg` : 'N/A'}`, 14, yOffset);
    yOffset += 15;

    // Items Section
    doc.setFontSize(14);
    doc.text("Order Items:", 14, yOffset);
    yOffset += 10;
    doc.setFontSize(12);
    orderDetails?.cartItems?.forEach((item, index) => {
      doc.text(`Title: ${item.title}${item.size ? ` (Size: ${item.size})` : ''}`, 14, yOffset);
      doc.text(`Quantity: ${item.quantity}`, 100, yOffset);
      doc.text(`Price: ${item.price}`, 160, yOffset);
      yOffset += 10;
    });
    yOffset += 5;

    // Shipping Address Section
    doc.setFontSize(14);
    doc.text("Shipping Address:", 14, yOffset);
    yOffset += 10;
    doc.setFontSize(12);
    doc.text(`Address: ${orderDetails?.shippingAddress?.address}`, 14, yOffset);
    yOffset += 10;
    doc.text(`City: ${orderDetails?.shippingAddress?.city}`, 14, yOffset);
    yOffset += 10;
    doc.text(`Pincode: ${orderDetails?.shippingAddress?.pincode}`, 14, yOffset);
    yOffset += 10;
    doc.text(`Phone: ${orderDetails?.shippingAddress?.phone}`, 14, yOffset);
    yOffset += 10;
    if (orderDetails?.shippingAddress?.notes) {
      doc.text(`Notes: ${orderDetails?.shippingAddress?.notes}`, 14, yOffset);
      yOffset += 10;
    }
    yOffset += 5;

    // Billing Address Section
    doc.setFontSize(14);
    doc.text("Billing Address:", 14, yOffset);
    yOffset += 10;
    doc.setFontSize(12);
    doc.text(`Address: ${orderDetails?.billingAddress?.address}`, 14, yOffset);
    yOffset += 10;
    doc.text(`City: ${orderDetails?.billingAddress?.city}`, 14, yOffset);
    yOffset += 10;
    doc.text(`Pincode: ${orderDetails?.billingAddress?.pincode}`, 14, yOffset);
    yOffset += 10;
    doc.text(`Phone: ${orderDetails?.billingAddress?.phone}`, 14, yOffset);
    yOffset += 10;
    if (orderDetails?.billingAddress?.notes) {
      doc.text(`Notes: ${orderDetails?.billingAddress?.notes}`, 14, yOffset);
      yOffset += 10;
    }
    
    // QR Code Section
    if (qrCodeUrl) {
      doc.addImage(qrCodeUrl, "PNG", 14, yOffset, 50, 50);
    }

    // Save the PDF
    doc.save(`Order_${orderDetails._id}_Details.pdf`);
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      {/* Added scrollable class to DialogContent */}
      <div className="max-h-[80vh] overflow-y-auto p-4">
        <div className="grid gap-6">
          {/* Order Summary Section */}
          <div className="grid gap-2">
            <div className="flex mt-6 items-center justify-between">
              <p className="font-medium">Order ID</p>
              <Label>{orderDetails?._id}</Label>
            </div>
            <div className="flex mt-2 items-center justify-between">
              <p className="font-medium">Order Date</p>
              <Label>{orderDetails?.orderDate.split("T")[0]}</Label>
            </div>
            <div className="flex mt-2 items-center justify-between">
              <p className="font-medium">Last Updated</p>
              <Label>{orderDetails?.orderUpdateDate ? orderDetails.orderUpdateDate.split("T")[0] : 'N/A'}</Label>
            </div>
            <div className="flex mt-2 items-center justify-between">
              <p className="font-medium">Order Price</p>
              <Label>{orderDetails?.totalAmount}</Label>
            </div>
            <div className="flex mt-2 items-center justify-between">
              <p className="font-medium">Shipping charges</p>
              <Label>{orderDetails?.shippingCharges}</Label>
            </div>
            <div className="flex mt-2 items-center justify-between">
              <p className="font-medium">Total Payable Amount</p>
              <Label>{(orderDetails?.totalAmount + orderDetails?.shippingCharges).toFixed(2)}</Label>
            </div>
            <div className="flex mt-2 items-center justify-between">
              <p className="font-medium">Payment method</p>
              <Label>{orderDetails?.paymentMethod}</Label>
            </div>
            <div className="flex mt-2 items-center justify-between">
              <p className="font-medium">Payment Status</p>
              <Label>{orderDetails?.paymentStatus}</Label>
            </div>
            <div className="flex mt-2 items-center justify-between">
              <p className="font-medium">Payment ID</p>
              <Label>{orderDetails?.paymentId || 'N/A'}</Label>
            </div>
            <div className="flex mt-2 items-center justify-between">
              <p className="font-medium">Payer ID</p>
              <Label>{orderDetails?.payerId || 'N/A'}</Label>
            </div>
            <div className="flex mt-2 items-center justify-between">
              <p className="font-medium">Order Status</p>
              <Label>
                <Badge
                  className={`py-1 px-3 ${
                    orderDetails?.orderStatus === "confirmed"
                      ? "bg-green-500"
                      : orderDetails?.orderStatus === "rejected"
                      ? "bg-red-600"
                      : "bg-black"
                  }`}
                >
                  {orderDetails?.orderStatus}
                </Badge>
              </Label>
            </div>
            <div className="flex mt-2 items-center justify-between">
              <p className="font-medium">Coupon Code</p>
              <Label>{orderDetails?.couponCode || 'N/A'}</Label>
            </div>
            <div className="flex mt-2 items-center justify-between">
              <p className="font-medium">Discount</p>
              <Label>{orderDetails?.discount || 0}</Label>
            </div>
            <div className="flex mt-2 items-center justify-between">
              <p className="font-medium">Free Shipping</p>
              <Label>{orderDetails?.freeShipping ? 'Yes' : 'No'}</Label>
            </div>
            <div className="flex mt-2 items-center justify-between">
              <p className="font-medium">Weight</p>
              <Label>{orderDetails?.weight ? `${orderDetails.weight} kg` : 'N/A'}</Label>
            </div>
          </div>
          <Separator />

          {/* Order Items Section */}
          <div className="overflow-y-auto max-h-[300px]">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <div className="font-medium">Order Items</div>
                <ul className="grid gap-3">
                  {orderDetails?.cartItems && orderDetails?.cartItems.length > 0
                    ? orderDetails?.cartItems.map((item, index) => (
                        <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <div className="flex-1">
                            <span className="font-medium">Title: {item.title}</span>
                            {item.size && <div className="text-sm text-gray-500 mt-1">Size: {item.size}</div>}
                            {item.image && (
                              <img src={item.image} alt={item.title} className="w-16 h-16 object-cover mt-2 rounded-md" />
                            )}
                          </div>
                          <div className="flex gap-4">
                            <span className="text-gray-600">Quantity: {item.quantity}</span>
                            <span className="font-medium">Price: {item.price}</span>
                          </div>
                        </li>
                      ))
                    : null}
                </ul>
              </div>
            </div>
          </div>

          {/* Shipping Address Section */}
          <div className="overflow-y-auto max-h-[300px] mt-4">
            <div className="grid gap-2">
              <div className="font-medium">Shipping Address</div>
              <div className="grid gap-2 p-4 bg-gray-50 rounded-md">
                <div className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-medium">{orderDetails?.shippingAddress?.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">City:</span>
                  <span className="font-medium">{orderDetails?.shippingAddress?.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pincode:</span>
                  <span className="font-medium">{orderDetails?.shippingAddress?.pincode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{orderDetails?.shippingAddress?.phone}</span>
                </div>
                {orderDetails?.shippingAddress?.notes && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Notes:</span>
                    <span className="font-medium">{orderDetails?.shippingAddress?.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Billing Address Section */}
          <div className="overflow-y-auto max-h-[300px] mt-4">
            <div className="grid gap-2">
              <div className="font-medium">Billing Address</div>
              <div className="grid gap-2 p-4 bg-gray-50 rounded-md">
                <div className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-medium">{orderDetails?.billingAddress?.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">City:</span>
                  <span className="font-medium">{orderDetails?.billingAddress?.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pincode:</span>
                  <span className="font-medium">{orderDetails?.billingAddress?.pincode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{orderDetails?.billingAddress?.phone}</span>
                </div>
                {orderDetails?.billingAddress?.notes && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Notes:</span>
                    <span className="font-medium">{orderDetails?.billingAddress?.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          {qrCodeUrl && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <p className="font-medium mb-2">Order QR Code</p>
              <div className="flex justify-center">
                <img src={qrCodeUrl} alt="QR Code" className="border border-gray-200 rounded-md" />
              </div>
            </div>
          )}

          {/* Download PDF Button */}
          <div className="mt-4 flex justify-center items-center relative">
            <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            </div>
            <button
              className="btn btn-primary relative z-10 px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
              onClick={handleDownloadPDF}
            >
              Download Invoice PDF
            </button>
          </div>

          {/* Order Status Update Form */}
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <CommonForm
              formControls={[{
                label: "Order Status",
                name: "status",
                componentType: "select",
                options: [
                  { id: "pending", label: "Pending" },
                  { id: "inProcess", label: "In Process" },
                  { id: "inShipping", label: "In Shipping" },
                  { id: "delivered", label: "Delivered" },
                  { id: "rejected", label: "Rejected" },
                ],
              }]}
              formData={formData}
              setFormData={setFormData}
              buttonText={"Update Order Status"}
              onSubmit={handleUpdateStatus}
            />
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;
