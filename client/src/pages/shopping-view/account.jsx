import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Address from "@/components/shopping-view/address";
import ShoppingOrders from "@/components/shopping-view/orders";
import { useSelector } from "react-redux";

function ShoppingAccount() {
  const [activeTab, setActiveTab] = useState("orders");
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="flex flex-col min-h-screen bg-rosh-background text-rosh-primary overflow-x-hidden">
      {/* Minimalist Header Section */}
      <div className="w-full mt-24 md:mt-32 px-4 md:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center"
        >
          <h1 className="font-serif text-4xl md:text-6xl italic font-light mb-4 tracking-wide text-rosh-primary">
            Welcome, {user?.userName || "Guest"}
          </h1>
          <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-light text-rosh-primary/60">
            Your Fine Jewellery Account
          </p>
        </motion.div>
      </div>

      {/* Account Content Section */}
      <div className="max-w-[1200px] w-full mx-auto px-4 md:px-8 py-8 md:py-16 flex flex-col md:flex-row gap-12 lg:gap-24">
        
        {/* Navigation Sidebar */}
        <div className="w-full md:w-[200px] shrink-0">
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-medium text-rosh-primary/50 mb-8 border-b border-rosh-primary/10 pb-4">
            Navigation
          </h2>
          <div className="flex flex-row md:flex-col gap-6 overflow-x-auto custom-scrollbar pb-4 md:pb-0">
            {["orders", "address"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative text-left text-sm md:text-base uppercase tracking-[0.15em] transition-colors duration-500 pb-2 md:pb-0 whitespace-nowrap ${
                  activeTab === tab ? "text-rosh-primary" : "text-rosh-primary/40 hover:text-rosh-primary/70"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute left-0 bottom-0 md:-left-4 md:top-1/2 md:-translate-y-1/2 md:bottom-auto w-full md:w-1 h-[1px] md:h-4 bg-rosh-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              {activeTab === "orders" ? <ShoppingOrders /> : <Address />}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

export default ShoppingAccount;
