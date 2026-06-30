import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, ArrowRight, X, Mail } from "lucide-react";
import { FaGithub, FaLinkedin, FaYoutube } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Payment images for example
import visaImage from '../../assets/visa.png';
import mastercardImage from '../../assets/mastercard.png';
import paypalImage from '../../assets/paypal.png';

// App Store & Play Store images
import playstoreImage from '../../assets/playstore.webp';
import appstoreImage from '../../assets/appstore.png';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1, delayChildren: 0.2 } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] } }
};

const textRevealVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 1, ease: [0.33, 1, 0.68, 1] } }
};

const Footer = ({ hideNewsletter = false }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const navigate = useNavigate();
  const [dbSubcategories, setDbSubcategories] = useState([]);

  useEffect(() => {
    fetch('/api/subcategories')
      .then(res => res.json())
      .then(data => setDbSubcategories(data.subCategories || []))
      .catch(console.error);
  }, []);

  const handleNavigateToListingPage = (filterValue) => {
    const capitalizedFilter = filterValue.charAt(0).toUpperCase() + filterValue.slice(1);
    
    // Find subcategory object matching the target collection name
    const targetSubcat = dbSubcategories.find(
      s => s.name.toLowerCase() === filterValue.toLowerCase() || 
           (filterValue.toLowerCase() === "earrings" && s.name.toLowerCase() === "earings")
    );
    
    const filterId = targetSubcat ? targetSubcat._id : capitalizedFilter;
    
    const currentFilter = {
      subcategories: [filterId],
    };
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/shop/listing?subcategories=${filterId}`);
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (email) {
      setIsLoading(true);
      setMessage("");

      try {
        const response = await fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email }),
        });

        const data = await response.json();
        if (response.ok) {
          setMessage("Subscribed successfully!"); 
        } else {
          setMessage(data.error || "An error occurred while subscribing.");
          console.error('Subscribe error:', data);
        }
      } catch (error) {
        console.error('Subscribe error:', error);
        setMessage("Error connecting to the server. Please try again later.");
      } finally {
        setIsLoading(false);
        setEmail(""); 
      }
    } else {
      setMessage("Please enter a valid email address.");
    }
  };

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    if (email) {
      setIsUnsubscribing(true);
      setMessage("");

      try {
        const testResponse = await fetch('/api/test');
        if (!testResponse.ok) {
          throw new Error('Server is not responding');
        }

        const response = await fetch('/api/newsletter/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        setMessage("Successfully unsubscribed from the newsletter.");
      } catch (error) {
        console.error('Unsubscribe error:', error);
        setMessage(error.message || "Error connecting to the server. Please try again later.");
      } finally {
        setIsUnsubscribing(false);
        setEmail("");
      }
    } else {
      setMessage("Please enter a valid email address.");
    }
  };

  return (
    <div className="w-full overflow-hidden selection:bg-rosh-accent selection:text-rosh-primary font-sans">
      
      {/* Upper Section - Newsletter */}
      {!hideNewsletter && (
      <div className="w-full bg-[#EBE5DE] text-rosh-primary py-10 md:py-14">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 lg:gap-8">
            
            {/* Statement */}
            <div className="lg:w-1/2 overflow-hidden">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={containerVariants}>
                 <motion.p variants={itemVariants} className="text-rosh-primary/60 uppercase tracking-[0.3em] text-[10px] mb-4 font-medium">The Private Newsletter</motion.p>
                 <h2 className="mb-4 text-3xl md:text-4xl lg:text-5xl">
                   <div className="overflow-hidden"><motion.span className="block" variants={textRevealVariants}>A curation of</motion.span></div>
                   <div className="overflow-hidden"><motion.span className="block italic text-rosh-primary/80" variants={textRevealVariants}>rare beauty</motion.span></div>
                 </h2>
                 <motion.p variants={itemVariants} className="font-light text-rosh-primary/70 tracking-wide text-sm max-w-md leading-relaxed">
                   Subscribe to receive privileged access to limited collections, high-jewellery showcases, and private events.
                 </motion.p>
              </motion.div>
            </div>

            {/* Form */}
            <div className="lg:w-1/2 w-full max-w-lg lg:ml-auto">
              <motion.form 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: [0.33, 1, 0.68, 1] }}
                viewport={{ once: true }}
                onSubmit={handleNewsletterSubmit} 
                className="relative w-full group"
              >
                <div className="relative">
                  <input
                    type="email"
                    className="w-full bg-transparent border-b border-rosh-primary/30 px-0 py-4 text-xl md:text-2xl text-rosh-primary placeholder:text-rosh-primary/40 focus:outline-none focus:border-rosh-primary transition-colors duration-500 font-serif italic"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <motion.div 
                    className="absolute bottom-0 left-0 h-[1px] bg-rosh-primary"
                    initial={{ width: "0%" }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
                    viewport={{ once: true }}
                  />
                  
                  <div className="absolute right-0 bottom-4 flex items-center gap-4">
                    {email && (
                      <button
                        type="button"
                        onClick={handleUnsubscribe}
                        className="text-rosh-primary/50 hover:text-rosh-primary transition-colors group-hover:opacity-100 opacity-0 duration-300"
                        title="Unsubscribe"
                      >
                        <X className="w-5 h-5" strokeWidth={1} />
                      </button>
                    )}
                    <button
                      type="submit"
                      className="text-rosh-primary hover:text-rosh-accent transition-colors flex items-center"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="uppercase tracking-[0.2em] text-[10px]">Wait</span>
                      ) : (
                        <ArrowRight className="w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-500" strokeWidth={1} />
                      )}
                    </button>
                  </div>
                </div>
                <AnimatePresence>
                  {message && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-[10px] mt-3 text-rosh-accent uppercase tracking-widest absolute"
                    >
                      {message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.form>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Lower Footer - Dark Background */}
      <div className="w-full bg-rosh-primary text-rosh-background relative">
        {/* Middle Footer - Links */}
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-10 md:py-16">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-16"
          >
            {/* Collections spanning 2 columns to replace The Maison */}
            <motion.div variants={itemVariants} className="flex flex-col md:col-span-2">
              <h4 className="font-sans font-medium text-rosh-background mb-8 tracking-[0.2em] uppercase text-[10px]">Collections</h4>
              <ul className="grid grid-cols-2 gap-x-8 gap-y-5 text-sm text-rosh-background/60 tracking-wide font-light font-serif">
                <li><button onClick={() => handleNavigateToListingPage('earrings')} className="hover:text-rosh-accent transition-colors duration-300 text-left text-inherit capitalize font-light">Earrings</button></li>
                <li><button onClick={() => handleNavigateToListingPage('pendants')} className="hover:text-rosh-accent transition-colors duration-300 text-left text-inherit capitalize font-light">Pendants</button></li>
                <li><button onClick={() => handleNavigateToListingPage('rings')} className="hover:text-rosh-accent transition-colors duration-300 text-left text-inherit capitalize font-light">Rings</button></li>
                <li><button onClick={() => handleNavigateToListingPage('cuffs')} className="hover:text-rosh-accent transition-colors duration-300 text-left text-inherit capitalize font-light">Cuffs</button></li>
                <li><button onClick={() => handleNavigateToListingPage('bracelets')} className="hover:text-rosh-accent transition-colors duration-300 text-left text-inherit capitalize font-light">Bracelets</button></li>
                <li><button onClick={() => handleNavigateToListingPage('chains')} className="hover:text-rosh-accent transition-colors duration-300 text-left text-inherit capitalize font-light">Chains</button></li>
                <li><button onClick={() => handleNavigateToListingPage('cufflinks')} className="hover:text-rosh-accent transition-colors duration-300 text-left text-inherit capitalize font-light">Cufflinks</button></li>
                <li><button onClick={() => handleNavigateToListingPage('anklets')} className="hover:text-rosh-accent transition-colors duration-300 text-left text-inherit capitalize font-light">Anklets</button></li>
              </ul>
            </motion.div>

            {/* Column 3 */}
            <motion.div variants={itemVariants} className="flex flex-col">
              <h4 className="font-sans font-medium text-rosh-background mb-8 tracking-[0.2em] uppercase text-[10px]">Client Services</h4>
              <ul className="space-y-5 text-xs text-rosh-background/60 tracking-widest uppercase font-light">
                <li><Link to="/shop/contact" className="hover:text-rosh-accent transition-colors duration-300">Contact Us</Link></li>
                <li><Link to="/shop/faq" className="hover:text-rosh-accent transition-colors duration-300">FAQ</Link></li>
                <li><Link to="/shop/refund" className="hover:text-rosh-accent transition-colors duration-300">Return and Refund</Link></li>
              </ul>
            </motion.div>

            {/* Column 4 */}
            <motion.div variants={itemVariants} className="flex flex-col">
              <h4 className="font-sans font-medium text-rosh-background mb-8 tracking-[0.2em] uppercase text-[10px]">Connect</h4>
              <ul className="space-y-5 text-xs text-rosh-background/60 tracking-widest uppercase font-light mb-10">
                <li><a href="mailto:roshfinejewellery@gmail.com" className="hover:text-rosh-accent transition-colors duration-300 lowercase">roshfinejewellery@gmail.com</a></li>
                <li><a href="tel:+917208200828" className="hover:text-rosh-accent transition-colors duration-300">+91 7208200828</a></li>
              </ul>
              <div className="flex space-x-6">
                <a href="#" className="text-rosh-background/50 hover:text-rosh-accent transition-colors duration-300 group">
                  <Instagram className="w-5 h-5 transform group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                </a>
                <a href="#" className="text-rosh-background/50 hover:text-rosh-accent transition-colors duration-300 group">
                  <Facebook className="w-5 h-5 transform group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                </a>
                <a href="#" className="text-rosh-background/50 hover:text-rosh-accent transition-colors duration-300 group">
                  <Twitter className="w-5 h-5 transform group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="relative border-t border-rosh-background/10">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true }}
            className="w-full px-6 md:px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-6 z-20 backdrop-blur-sm"
          >
            <div className="flex flex-wrap items-center justify-center gap-4 text-[9px] md:text-[10px] text-rosh-background/40 tracking-[0.2em] uppercase font-light">
              <span>&copy; {new Date().getFullYear()} Rosh Fine Jewellery</span>
              <span className="hidden md:inline">|</span>
              <Link to="/shop/terms" className="hover:text-rosh-accent transition-colors">Terms of Service</Link>
              <span className="hidden md:inline">|</span>
              <Link to="/shop/privacy" className="hover:text-rosh-accent transition-colors">Privacy Policy</Link>
            </div>

            <div className="flex items-center space-x-5 opacity-40 hover:opacity-100 transition-opacity duration-500 filter grayscale hover:grayscale-0">
              <img src={visaImage} alt="Visa" className="h-3 w-auto" />
              <img src={mastercardImage} alt="MasterCard" className="h-3 w-auto" />
              <img src={paypalImage} alt="PayPal" className="h-3 w-auto" />
            </div>
          </motion.div>
        </div>
      </div>

    </div>
  );
};

export default Footer;
