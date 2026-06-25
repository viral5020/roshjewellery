import { motion } from "framer-motion";
import { useEffect } from "react";
import Footer from "@/components/shopping-view/footer";

const ContactUs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#EBE5DE] text-rosh-primary font-sans flex flex-col">
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 md:px-12 py-20 md:py-32 flex flex-col justify-center">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.33, 1, 0.68, 1] }}
          className="text-center mb-20 md:mb-32 mt-10 md:mt-0"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] font-medium mb-6 opacity-60">Get in Touch</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif italic">Contact Us</h1>
        </motion.div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 max-w-5xl mx-auto w-full mb-20">
          
          {/* Details */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
            className="flex flex-col space-y-12"
          >
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium mb-4 opacity-50">Address</h3>
              <p className="font-serif text-xl md:text-2xl leading-relaxed text-rosh-primary/90">
                Rosh Fine Jewellery,<br />
                C - 4/5, Dev Nagar, Tonk Road,<br />
                Jaipur, Rajasthan 302018
              </p>
            </div>
            
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium mb-4 opacity-50">Hours</h3>
              <p className="font-serif text-xl md:text-2xl leading-relaxed text-rosh-primary/90">
                Monday–Saturday<br />
                11:00 AM – 6:00 PM
              </p>
            </div>
            
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium mb-4 opacity-50">Contact</h3>
              <div className="flex flex-col space-y-2 font-serif text-xl md:text-2xl text-rosh-primary/90">
                <a href="tel:+919001869762" className="hover:text-rosh-accent transition-colors duration-300 w-fit">+91 9001869762</a>
                <a href="mailto:contact@rosh.com" className="hover:text-rosh-accent transition-colors duration-300 w-fit">contact@rosh.com</a>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4, ease: [0.33, 1, 0.68, 1] }}
            className="flex flex-col"
          >
            <form className="flex flex-col space-y-10" onSubmit={(e) => e.preventDefault()}>
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  className="w-full bg-transparent border-b border-rosh-primary/30 px-0 py-4 text-xl font-serif italic text-rosh-primary placeholder:text-rosh-primary/40 focus:outline-none focus:border-rosh-primary transition-colors duration-500"
                  required
                />
              </div>
              
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  className="w-full bg-transparent border-b border-rosh-primary/30 px-0 py-4 text-xl font-serif italic text-rosh-primary placeholder:text-rosh-primary/40 focus:outline-none focus:border-rosh-primary transition-colors duration-500"
                  required
                />
              </div>
              
              <div className="relative group">
                <textarea 
                  placeholder="Your Message" 
                  rows={4}
                  className="w-full bg-transparent border-b border-rosh-primary/30 px-0 py-4 text-xl font-serif italic text-rosh-primary placeholder:text-rosh-primary/40 focus:outline-none focus:border-rosh-primary transition-colors duration-500 resize-none"
                  required
                ></textarea>
              </div>
              
              <button 
                type="submit"
                className="self-start uppercase tracking-[0.2em] text-[10px] font-medium border border-rosh-primary/20 px-10 py-4 hover:bg-rosh-primary hover:text-rosh-background transition-colors duration-500"
              >
                Send Message
              </button>
            </form>
          </motion.div>
          
        </div>
      </div>
      
      <Footer hideNewsletter />
    </div>
  );
};

export default ContactUs;
