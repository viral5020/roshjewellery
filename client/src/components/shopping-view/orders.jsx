import { useEffect, useState } from "react";
import { Dialog } from "../ui/dialog";
import ShoppingOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  getAllOrdersByUserId,
  getOrderDetails,
  resetOrderDetails,
} from "@/store/shop/order-slice";

function ShoppingOrders() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orderList, orderDetails } = useSelector((state) => state.shopOrder);
  const { currency, exchangeRates } = useSelector((state) => state.currency);

  const convertPrice = (price) => {
    if (!exchangeRates || !currency || !exchangeRates[currency]) {
      return price;
    }
    return (price * exchangeRates[currency]).toFixed(2);
  };

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetails(getId));
  }

  useEffect(() => {
    dispatch(getAllOrdersByUserId(user?.id));
  }, [dispatch, user]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  const sortedOrders = orderList
    ? [...orderList].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
    : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="flex flex-col">
      <h3 className="font-serif text-2xl md:text-3xl italic text-rosh-primary mb-8 border-b border-rosh-primary/10 pb-4">
        Order History
      </h3>

      <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-2 md:pr-4">
        {sortedOrders && sortedOrders.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-4"
          >
            {sortedOrders.map((orderItem) => (
              <motion.div 
                key={orderItem?._id}
                variants={itemVariants}
                className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/40 hover:bg-white/60 border border-rosh-primary/10 transition-all duration-500"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-12 flex-1">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-rosh-primary/50">Order ID</span>
                    <span className="text-xs tracking-wider text-rosh-primary">{orderItem?._id.slice(-8).toUpperCase()}</span>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-rosh-primary/50">Date</span>
                    <span className="text-xs text-rosh-primary">{new Date(orderItem?.orderDate).toLocaleDateString()}</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-rosh-primary/50">Total</span>
                    <span className="text-sm font-medium text-rosh-primary">
                      {currency} {convertPrice(orderItem?.totalWithShipping)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-rosh-primary/50">Status</span>
                    <span className={`text-[10px] uppercase tracking-[0.2em] ${
                      orderItem?.orderStatus === "confirmed" ? "text-green-600/80" : 
                      orderItem?.orderStatus === "rejected" ? "text-red-500/80" : 
                      "text-rosh-primary/70"
                    }`}>
                      {orderItem?.orderStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-6 md:mt-0 md:ml-8 shrink-0">
                  <Dialog
                    open={openDetailsDialog}
                    onOpenChange={() => {
                      setOpenDetailsDialog(false);
                      dispatch(resetOrderDetails());
                    }}
                  >
                    <button
                      onClick={() => handleFetchOrderDetails(orderItem?._id)}
                      className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-rosh-primary border-b border-rosh-primary/30 pb-1 hover:text-rosh-accent hover:border-rosh-accent transition-colors duration-300"
                    >
                      View Details
                    </button>
                    <ShoppingOrderDetailsView orderDetails={orderDetails} />
                  </Dialog>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 text-center text-rosh-primary/50 text-sm tracking-wide font-light"
          >
            You have no order history.
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default ShoppingOrders;
