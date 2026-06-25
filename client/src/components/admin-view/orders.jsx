import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import AdminOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetOrderDetails,
  updateOrderStatus,
} from "@/store/admin/order-slice";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useToast } from "../ui/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

function AdminOrdersView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { orderList, orderDetails } = useSelector((state) => state.adminOrder);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("");

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetailsForAdmin(getId));
  }

  useEffect(() => {
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);

  // Sort the orderList based on the orderDate, with the latest orders first
  const sortedOrders = orderList
    ? [...orderList].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
    : [];

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  // Handle order selection
  const handleOrderSelect = (orderId) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  // Handle select all orders
  const handleSelectAll = () => {
    if (selectedOrders.length === sortedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(sortedOrders.map(order => order._id));
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedOrders.length === 0) {
      toast({
        title: "Please select orders and a status",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatePromises = selectedOrders.map(orderId =>
        dispatch(updateOrderStatus({ id: orderId, orderStatus: bulkStatus }))
      );

      await Promise.all(updatePromises);
      dispatch(getAllOrdersForAdmin());
      setSelectedOrders([]);
      setBulkStatus("");
      toast({
        title: "Orders updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error updating orders",
        variant: "destructive",
      });
    }
  };

  // Generate and download invoice for selected orders
  const downloadSelectedInvoices = async () => {
    if (selectedOrders.length === 0) {
      toast({
        title: "Please select at least one order",
        variant: "destructive",
      });
      return;
    }

    const selectedOrdersData = sortedOrders.filter(order => 
      selectedOrders.includes(order._id)
    );

    // Create a single PDF document
    const doc = new jsPDF();
    let currentPage = 1;
    const maxHeight = 250; // Maximum height before new page
    let yPos = 20; // Starting y position

    // Add title for the combined invoice
    doc.setFontSize(24);
    doc.text("Combined Order Invoices", 105, yPos, { align: "center" });
    yPos += 20;

    // Process each order
    for (const order of selectedOrdersData) {
      // Check if we need a new page
      if (yPos > maxHeight) {
        doc.addPage();
        currentPage++;
        yPos = 20;
      }

      // Add order information
      doc.setFontSize(16);
      doc.text(`Order #${order._id}`, 20, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.text(`Date: ${order.orderDate.split("T")[0]}`, 20, yPos);
      yPos += 10;
      doc.text(`Total Amount: ${order.totalWithShipping}`, 20, yPos);
      yPos += 10;
      doc.text(`Status: ${order.orderStatus}`, 20, yPos);
      yPos += 15;

      // Add items
      doc.text("Order Items:", 20, yPos);
      yPos += 10;

      // Add items table
      const items = order.cartItems.map((item, index) => [
        index + 1,
        item.title,
        item.quantity,
        `$${item.price}`,
        `$${(item.quantity * item.price).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Item', 'Quantity', 'Price', 'Total']],
        body: items,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] }
      });

      yPos = doc.lastAutoTable.finalY + 15;

      // Generate QR code
      const qrData = `
        Order ID: ${order._id}
        Date: ${order.orderDate.split("T")[0]}
        Total: ${order.totalWithShipping}
        Status: ${order.orderStatus}
      `;
      
      const qrCodeUrl = await QRCode.toDataURL(qrData);
      
      // Position QR code on the right side with proper spacing
      const qrSize = 40;
      const qrX = doc.internal.pageSize.width - qrSize - 20; // 20px from right edge
      const qrY = yPos - 10; // 10px above the current position
      
      // Add a border around the QR code
      doc.setDrawColor(200, 200, 200);
      doc.rect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4);
      
      // Add the QR code
      doc.addImage(qrCodeUrl, "PNG", qrX, qrY, qrSize, qrSize);

      // Add separator between orders
      if (order !== selectedOrdersData[selectedOrdersData.length - 1]) {
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPos + qrSize + 10, doc.internal.pageSize.width - 20, yPos + qrSize + 10);
        yPos += qrSize + 30; // Add more space after QR code
      }
    }

    // Add page numbers
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${totalPages}`, 105, 285, { align: "center" });
    }

    // Save the combined PDF
    doc.save("combined_orders_invoice.pdf");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>All Orders</CardTitle>
          <div className="flex gap-4 items-center">
            <Select value={bulkStatus} onValueChange={setBulkStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inProcess">In Process</SelectItem>
                <SelectItem value="inShipping">In Shipping</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleBulkStatusUpdate}
              disabled={!bulkStatus || selectedOrders.length === 0}
            >
              Update Selected ({selectedOrders.length})
            </Button>
            <Button 
              onClick={downloadSelectedInvoices}
              disabled={selectedOrders.length === 0}
            >
              Download Invoices
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedOrders.length === sortedOrders.length && sortedOrders.length > 0}
                  indeterminate={selectedOrders.length > 0 && selectedOrders.length < sortedOrders.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Order Price</TableHead>
              <TableHead>
                <span className="sr-only">Details</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrders && sortedOrders.length > 0
              ? sortedOrders.map((orderItem) => (
                  <TableRow key={orderItem?._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedOrders.includes(orderItem._id)}
                        onCheckedChange={() => handleOrderSelect(orderItem._id)}
                      />
                    </TableCell>
                    <TableCell>{orderItem?._id}</TableCell>
                    <TableCell>{orderItem?.orderDate.split("T")[0]}</TableCell>
                    <TableCell>
                      <Badge
                        className={`py-1 px-3 ${
                          orderItem?.orderStatus === "confirmed"
                            ? "bg-green-500"
                            : orderItem?.orderStatus === "rejected"
                            ? "bg-red-600"
                            : "bg-black"
                        }`}
                      >
                        {orderItem?.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>${orderItem?.totalWithShipping}</TableCell>
                    <TableCell>
                      <Dialog
                        open={openDetailsDialog}
                        onOpenChange={() => {
                          setOpenDetailsDialog(false);
                          dispatch(resetOrderDetails());
                        }}
                      >
                        <Button
                          onClick={() =>
                            handleFetchOrderDetails(orderItem?._id)
                          }
                        >
                          View Details
                        </Button>
                        <AdminOrderDetailsView orderDetails={orderDetails} />
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default AdminOrdersView;
