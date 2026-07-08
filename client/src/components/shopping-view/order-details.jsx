import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { DialogContent } from "../ui/dialog";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import axios from "axios";

function OrderItemCard({ item }) {
  const [productImage, setProductImage] = useState(item?.image || "");

  useEffect(() => {
    async function fetchImage() {
      try {
        const response = await axios.get(`/api/shop/products/get/${item.productId}`);
        if (response.data?.success && response.data?.data?.image) {
          setProductImage(response.data.data.image);
        }
      } catch (error) {
        console.error("Failed to fetch product image:", error);
      }
    }
    if (item?.productId) {
      fetchImage();
    }
  }, [item?.productId]);

  return (
    <div className="flex gap-4 p-4 bg-white/40 border border-rosh-primary/10 hover:border-rosh-primary/30 transition-colors">
      {productImage ? (
        <div className="w-20 h-20 shrink-0 bg-rosh-primary/5 overflow-hidden">
          <img src={productImage} alt={item.title} className="w-full h-full object-cover mix-blend-multiply" />
        </div>
      ) : (
        <div className="w-20 h-20 shrink-0 bg-rosh-primary/5 flex items-center justify-center">
          <span className="text-[10px] uppercase tracking-widest opacity-50">No Image</span>
        </div>
      )}
      <div className="flex-1 flex flex-col justify-center">
        <h4 className="font-medium text-sm text-rosh-primary line-clamp-1">{item.title}</h4>
        {item.size && <p className="text-xs text-rosh-primary/70 mt-1">Size: {item.size}</p>}
        <div className="flex items-center gap-4 mt-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/60">Qty: {item.quantity}</span>
          <span className="text-xs font-medium text-rosh-primary">₹{item.price}</span>
        </div>
      </div>
    </div>
  );
}

function ShoppingOrderDetailsView({ orderDetails }) {
  const { user } = useSelector((state) => state.auth);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    if (orderDetails?._id) {
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
        ADDRESS - ${orderDetails?.shippingAddress?.address}
        CITY - ${orderDetails?.shippingAddress?.city}
        PINCODE - ${orderDetails?.shippingAddress?.pincode}
        PHONE - ${orderDetails?.shippingAddress?.phone}
      `;
    
      QRCode.toDataURL(orderInfo, { width: 120, margin: 1, color: { dark: '#301C26', light: '#00000000' } }, (err, url) => {
        if (err) console.error(err);
        setQrCodeUrl(url);
      });
    }
  }, [orderDetails, user.userName]);

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
    doc.text(`Total Payable Amount: ${(orderDetails?.totalAmount + orderDetails?.shippingCharges).toFixed(2)}`, 14, yOffset);
    yOffset += 10;
    doc.text(`Payment Method: ${orderDetails?.paymentMethod}`, 14, yOffset);
    yOffset += 10;
    doc.text(`Order Status: ${orderDetails?.orderStatus}`, 14, yOffset);
    yOffset += 15;

    // Items Section
    doc.setFontSize(14);
    doc.text("Order Items:", 14, yOffset);
    yOffset += 10;
    doc.setFontSize(12);
    orderDetails?.cartItems?.forEach((item) => {
      doc.text(`Title: ${item.title}${item.size ? ` (Size: ${item.size})` : ''}`, 14, yOffset);
      doc.text(`Quantity: ${item.quantity}`, 100, yOffset);
      doc.text(`Price: ${item.price}`, 160, yOffset);
      yOffset += 10;
    });
    yOffset += 5;

    // Save the PDF
    doc.save(`Order_${orderDetails._id}_Details.pdf`);
  };

  const DetailRow = ({ label, value, highlight = false }) => (
    <div className="flex justify-between items-center py-3 border-b border-rosh-primary/5 last:border-0">
      <span className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/60">{label}</span>
      <span className={`text-sm ${highlight ? 'font-medium text-rosh-primary' : 'text-rosh-primary/90 font-light'} ${value?.length > 30 ? 'truncate max-w-[200px]' : ''}`} title={value}>
        {value || 'N/A'}
      </span>
    </div>
  );

  return (
    <DialogContent className="sm:max-w-4xl bg-rosh-background border border-rosh-primary/20 text-rosh-primary p-0 overflow-hidden rounded-none shadow-2xl">
      <div className="max-h-[85vh] overflow-y-auto custom-scrollbar flex flex-col">
        
        {/* Header */}
        <div className="px-6 md:px-12 py-8 md:py-10 bg-white/40 border-b border-rosh-primary/10 flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl italic text-rosh-primary mb-2">Order Summary</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/50">ID: {orderDetails?._id}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-[10px] uppercase tracking-[0.3em] px-3 py-1 border ${
              orderDetails?.orderStatus === "confirmed" ? "border-green-800 text-green-800 bg-green-50" : 
              orderDetails?.orderStatus === "rejected" ? "border-red-800 text-red-800 bg-red-50" : 
              "border-rosh-primary text-rosh-primary bg-transparent"
            }`}>
              {orderDetails?.orderStatus}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 flex-1">
          
          {/* Left Column: Details & Address */}
          <div className="space-y-12">
            
            {/* Overview */}
            <div>
              <h3 className="font-serif text-xl italic text-rosh-primary mb-6 border-b border-rosh-primary/10 pb-2">Overview</h3>
              <div className="flex flex-col">
                <DetailRow label="Date Placed" value={orderDetails?.orderDate?.split("T")[0]} />
                <DetailRow label="Last Updated" value={orderDetails?.orderUpdateDate?.split("T")[0]} />
                <DetailRow label="Payment Method" value={orderDetails?.paymentMethod} />
                <DetailRow label="Payment Status" value={orderDetails?.paymentStatus} highlight />
                <DetailRow label="Transaction ID" value={orderDetails?.paymentId} />
              </div>
            </div>

            {/* Financials */}
            <div>
              <h3 className="font-serif text-xl italic text-rosh-primary mb-6 border-b border-rosh-primary/10 pb-2">Financials</h3>
              <div className="flex flex-col">
                <DetailRow label="Subtotal" value={`₹${orderDetails?.totalAmount}`} />
                <DetailRow label="Shipping" value={`₹${orderDetails?.shippingCharges}`} />
                {orderDetails?.discount > 0 && (
                  <DetailRow label="Discount" value={`-₹${orderDetails?.discount}`} />
                )}
                <div className="flex justify-between items-center py-4 mt-2 border-t border-rosh-primary/20">
                  <span className="text-xs uppercase tracking-[0.2em] font-medium text-rosh-primary">Total Paid</span>
                  <span className="font-serif text-xl italic text-rosh-primary">
                    ₹{(orderDetails?.totalAmount + orderDetails?.shippingCharges).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <h3 className="font-serif text-lg italic text-rosh-primary mb-4">Shipping</h3>
                <div className="text-sm font-light text-rosh-primary/80 leading-relaxed">
                  <p>{orderDetails?.shippingAddress?.address}</p>
                  <p>{orderDetails?.shippingAddress?.city}, {orderDetails?.shippingAddress?.pincode}</p>
                  <p className="mt-2 text-xs opacity-70">Ph: {orderDetails?.shippingAddress?.phone}</p>
                </div>
              </div>
              <div>
                <h3 className="font-serif text-lg italic text-rosh-primary mb-4">Billing</h3>
                <div className="text-sm font-light text-rosh-primary/80 leading-relaxed">
                  <p>{orderDetails?.billingAddress?.address}</p>
                  <p>{orderDetails?.billingAddress?.city}, {orderDetails?.billingAddress?.pincode}</p>
                  <p className="mt-2 text-xs opacity-70">Ph: {orderDetails?.billingAddress?.phone}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Items & Action */}
          <div className="space-y-12">
            
            {/* Items */}
            <div>
              <h3 className="font-serif text-xl italic text-rosh-primary mb-6 border-b border-rosh-primary/10 pb-2">Purchased Items</h3>
              <div className="flex flex-col gap-4">
                {orderDetails?.cartItems?.map((item, index) => (
                  <OrderItemCard key={index} item={item} />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white/40 p-8 border border-rosh-primary/10 flex flex-col items-center justify-center text-center gap-6">
              {qrCodeUrl && (
                <div className="flex flex-col items-center gap-3">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-rosh-primary/50">Digital Receipt</span>
                  <div className="p-2 bg-white border border-rosh-primary/10">
                    <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24" />
                  </div>
                </div>
              )}
              <button
                className="w-full bg-rosh-primary text-rosh-background py-4 text-[10px] uppercase tracking-[0.3em] hover:bg-rosh-accent transition-all duration-300"
                onClick={handleDownloadPDF}
              >
                Download Invoice
              </button>
            </div>

          </div>
        </div>

      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;
