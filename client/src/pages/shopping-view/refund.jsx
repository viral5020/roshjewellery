import { motion } from "framer-motion";
import { useEffect } from "react";
import Footer from "@/components/shopping-view/footer";

const RefundPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const contentParagraphs = [
    <>Rosh Fine Jewellery <strong>DOES NOT ACCEPT RETURNS OR ISSUE REFUNDS FOR ANY REASON</strong>, however we do allow exchange within 7 days of the delivery date. In the event you are dissatisfied with your item for any reason, we will allow you to exchange your item one time for an item of equal or greater value. Jewellery items can be exchanged for jewellery only. Please contact us by email at concierge@rosh.com and we will provide you with instructions on completing your exchange.</>,
    "If you are sending an item back due to a manufacturing issue or for a ring sizing issue, you must first request a return number for your package. Rosh Fine Jewellery is not responsible for any loss or damage that occurs during shipping. All items must be accompanied by the original sales receipt or order number. Please mail the package to the address provided in the instructions you receive from concierge@rosh.com and ensure that your name, address and return authorisation number are clearly printed on the outside of the package.",
    "Please note: All returns should be properly packed in the same way as it was sent to you. The package contents should be properly covered and taped. Any package that is not properly covered and taped will not be considered eligible for returns and exchanges.",
    "Rosh Fine Jewellery will contact you upon receipt of the package. Our quality inspection team must confirm the returned jewellery has not been damaged, or suffered excessive wear and tear during the 7-day period. All items must arrive back in their original condition."
  ];

  return (
    <div className="min-h-screen bg-[#EBE5DE] text-rosh-primary font-sans flex flex-col">
      <div className="flex-1 max-w-[1000px] w-full mx-auto px-6 md:px-12 py-20 md:py-32">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.33, 1, 0.68, 1] }}
          className="text-center mb-16 md:mb-24 mt-10 md:mt-0"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] font-medium mb-6 opacity-60">Client Services</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif italic mb-8">Return and Refund Policy</h1>
        </motion.div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
          className="flex flex-col space-y-8 mb-20 max-w-4xl mx-auto"
        >
          {contentParagraphs.map((paragraph, index) => (
            <p key={index} className="text-rosh-primary/80 font-serif text-lg md:text-xl leading-relaxed">
              {paragraph}
            </p>
          ))}
        </motion.div>

      </div>
      
      <Footer hideNewsletter />
    </div>
  );
};

export default RefundPolicy;
