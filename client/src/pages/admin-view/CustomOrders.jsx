import { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function CustomOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchCustomOrders = async () => {
    try {
      const response = await axios.get("/api/custom/get");
      if (response.data?.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching custom orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch custom orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomOrders();
  }, []);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Custom Jewelry Orders</h2>
      </div>

      <div className="rounded-md border bg-white">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Customer Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Phone</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Jewelry Type</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Budget</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-24 text-center align-middle text-muted-foreground">
                    No custom jewelry requests found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle font-medium">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4 align-middle">{order.fullName}</td>
                    <td className="p-4 align-middle">{order.email}</td>
                    <td className="p-4 align-middle">{order.number}</td>
                    <td className="p-4 align-middle">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                        {order.type}
                      </span>
                    </td>
                    <td className="p-4 align-middle font-semibold text-emerald-600">
                      ₹{order.budget.toLocaleString("en-IN")}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(order)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Commission Request Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-bold">Customer Name</span>
                  <p className="text-sm font-medium text-slate-900 mt-1">{selectedOrder.fullName}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-bold">Date Submitted</span>
                  <p className="text-sm font-medium text-slate-900 mt-1">
                    {new Date(selectedOrder.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-bold">Email Address</span>
                  <p className="text-sm font-medium text-slate-900 mt-1">{selectedOrder.email}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-bold">Contact Number</span>
                  <p className="text-sm font-medium text-slate-900 mt-1">{selectedOrder.number}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-bold">Jewelry Type</span>
                  <p className="text-sm mt-1">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800">
                      {selectedOrder.type}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-bold">Investment Range</span>
                  <p className="text-sm font-semibold text-emerald-600 mt-1">
                    ₹{selectedOrder.budget.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs text-muted-foreground uppercase font-bold block mb-2">
                  Vision & Specifications
                </span>
                <div className="bg-slate-50 p-4 rounded-lg border text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedOrder.message}
                </div>
              </div>

              {selectedOrder.fileUrl && (
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-bold block mb-2">
                    Inspiration & Reference Images
                  </span>
                  <div className="border rounded-lg overflow-hidden max-w-md bg-slate-50">
                    <a
                      href={selectedOrder.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block relative"
                    >
                      <img
                        src={selectedOrder.fileUrl}
                        alt="Reference Inspiration"
                        className="w-full object-contain max-h-[300px] transition-transform duration-300 group-hover:scale-102"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 text-white font-medium text-xs">
                        Click to Open In New Tab
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CustomOrdersPage;
