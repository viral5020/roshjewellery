import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Plus, Minus } from "lucide-react";
import Footer from "@/components/shopping-view/footer";

const faqData = [
  {
    category: "Ordering",
    questions: [
      {
        q: "How do I know which size is right for me?",
        a: "If you're not quite sure which size is right for you, refer to our size guides. They're located underneath the available sizes for each of our products."
      },
      {
        q: "Can I alter or cancel my order after placing it?",
        a: "We completely get it, we change our minds too! While we wish we could, once an order is placed, we are unable to alter or cancel it at this time. We hope to have a cancellation window one day in the future."
      },
      {
        q: "What if the item doesn't work out?",
        a: "Should the item(s) not work out, make sure to exchange for a preferred style or return for a refund. As a reminder, domestic return shipping is free."
      }
    ]
  },
  {
    category: "Shipping, Returns & Exchanges",
    questions: [
      {
        q: "Which shipping carriers do you use?",
        a: "We use all major carriers, and local courier partners. You'll be asked to select a delivery method during checkout."
      },
      {
        q: "How can I track my order?",
        a: "Once your order is placed, you will receive a confirmation email letting you know that our fulfillment team has received your order. Once your order is fulfilled, you will receive an email notification with your tracking information. Shipping fees are non-refundable in the case of returns."
      },
      {
        q: "Do you ship internationally?",
        a: "Yes, we ship all over the world. Shipping costs will apply, and will be added at checkout."
      }
    ]
  }
];

const AccordionItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-rosh-primary/20">
      <button
        className="w-full py-8 flex justify-between items-center text-left focus:outline-none group"
        onClick={onClick}
      >
        <h4 className="font-serif text-xl md:text-2xl text-rosh-primary group-hover:text-rosh-accent transition-colors duration-300 pr-8">
          {question}
        </h4>
        <span className="text-rosh-primary/50 group-hover:text-rosh-accent transition-colors duration-300 flex-shrink-0">
          {isOpen ? <Minus strokeWidth={1.5} className="w-5 h-5" /> : <Plus strokeWidth={1.5} className="w-5 h-5" />}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <p className="pb-8 text-rosh-primary/70 font-sans text-sm md:text-base leading-relaxed max-w-3xl">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleToggle = (globalIndex) => {
    setOpenIndex(openIndex === globalIndex ? null : globalIndex);
  };

  return (
    <div className="min-h-screen bg-[#EBE5DE] text-rosh-primary font-sans flex flex-col">
      <div className="flex-1 max-w-[1200px] w-full mx-auto px-6 md:px-12 py-20 md:py-32">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.33, 1, 0.68, 1] }}
          className="text-center mb-20 md:mb-32 mt-10 md:mt-0"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] font-medium mb-6 opacity-60">Client Services</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif italic">Frequently Asked Questions</h1>
        </motion.div>

        {/* Content */}
        <div className="flex flex-col space-y-24 mb-20">
          {faqData.map((section, sectionIndex) => (
            <motion.div 
              key={sectionIndex}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: sectionIndex * 0.1, ease: [0.33, 1, 0.68, 1] }}
              className="flex flex-col md:flex-row md:space-x-12 lg:space-x-24"
            >
              {/* Category Title */}
              <div className="md:w-1/3 mb-8 md:mb-0">
                <h3 className="text-sm md:text-base uppercase tracking-widest font-medium text-rosh-primary sticky top-32">
                  {section.category}
                </h3>
              </div>
              
              {/* Questions */}
              <div className="md:w-2/3 flex flex-col">
                {section.questions.map((q, qIndex) => {
                  const globalIndex = `${sectionIndex}-${qIndex}`;
                  return (
                    <AccordionItem
                      key={globalIndex}
                      question={q.q}
                      answer={q.a}
                      isOpen={openIndex === globalIndex}
                      onClick={() => handleToggle(globalIndex)}
                    />
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-center py-20 border-t border-rosh-primary/10 mt-10"
        >
          <p className="font-serif italic text-2xl md:text-3xl mb-6">Still have questions?</p>
          <a 
            href="/shop/contact"
            className="inline-block uppercase tracking-[0.2em] text-[10px] font-medium border border-rosh-primary/20 px-10 py-4 hover:bg-rosh-primary hover:text-rosh-background transition-colors duration-500"
          >
            Contact Us
          </a>
        </motion.div>

      </div>
      
      <Footer hideNewsletter />
    </div>
  );
};

export default FAQPage;
