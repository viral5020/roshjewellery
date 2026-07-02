import React from "react";
import { Facebook, Twitter, Instagram, Github as GitHub, Mail, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  const handleCollectionClick = (collectionName) => {
    sessionStorage.removeItem("filters");
    navigate(`/shop/${collectionName}`);
  };

  return (
    <footer className="w-full bg-rosh-primary text-rosh-background font-sans mt-auto">
      {/* Newsletter Section */}
      <div className="w-full border-b border-rosh-background/10">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-16 md:py-24 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-serif mb-4">Join the Inner Circle</h3>
            <p className="text-rosh-background/70 font-light max-w-md tracking-wide">
              Subscribe to receive updates on new arrivals, exclusive collections, and early access to events.
            </p>
          </div>
          <div className="md:w-1/2 w-full max-w-md md:max-w-none flex justify-center md:justify-end">
            <div className="relative w-full max-w-md flex items-center">
              <Mail className="absolute left-4 w-5 h-5 text-rosh-background/50" />
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="w-full bg-transparent border border-rosh-background/30 rounded-none py-4 pl-12 pr-16 text-rosh-background placeholder:text-rosh-background/50 focus:outline-none focus:border-rosh-background transition-colors"
              />
              <button className="absolute right-0 top-0 h-full px-6 flex items-center justify-center hover:bg-rosh-background hover:text-rosh-primary transition-colors border-l border-rosh-background/30">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Brand Info */}
          <div className="flex flex-col items-start">
            <h4 className="text-xl font-serif tracking-widest uppercase mb-6">Rosh Fine Jewellery</h4>
            <p className="text-rosh-background/60 text-sm font-light leading-relaxed mb-8 max-w-xs">
              Crafting modern heirlooms with extraordinary craftsmanship and timeless design.
            </p>
            <div className="flex items-center gap-5">
              <a href="#" className="text-rosh-background/70 hover:text-rosh-background transition-colors">
                <Instagram className="w-5 h-5" strokeWidth={1.5} />
              </a>
              <a href="#" className="text-rosh-background/70 hover:text-rosh-background transition-colors">
                <Facebook className="w-5 h-5" strokeWidth={1.5} />
              </a>
              <a href="#" className="text-rosh-background/70 hover:text-rosh-background transition-colors">
                <Twitter className="w-5 h-5" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col">
            <h4 className="text-sm font-sans tracking-[0.2em] uppercase mb-6 text-rosh-background/80">Explore</h4>
            <ul className="flex flex-col gap-4 text-sm font-light text-rosh-background/60">
              <li>
                <Link to="/shop/home" className="hover:text-rosh-background transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/shop/new-arrivals" className="hover:text-rosh-background transition-colors">New Arrivals</Link>
              </li>
              <li>
                <Link to="/shop/best-sellers" className="hover:text-rosh-background transition-colors">Best Sellers</Link>
              </li>
              <li>
                <Link to="/shop/home#about" className="hover:text-rosh-background transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/shop/contact" className="hover:text-rosh-background transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Collections */}
          <div className="flex flex-col">
            <h4 className="text-sm font-sans tracking-[0.2em] uppercase mb-6 text-rosh-background/80">Collections</h4>
            <ul className="flex flex-col gap-4 text-sm font-light text-rosh-background/60">
              <li>
                <button onClick={() => handleCollectionClick('earrings')} className="hover:text-rosh-background transition-colors uppercase tracking-widest text-xs">Earrings</button>
              </li>
              <li>
                <button onClick={() => handleCollectionClick('necklaces')} className="hover:text-rosh-background transition-colors uppercase tracking-widest text-xs">Necklaces</button>
              </li>
              <li>
                <button onClick={() => handleCollectionClick('rings')} className="hover:text-rosh-background transition-colors uppercase tracking-widest text-xs">Rings</button>
              </li>
              <li>
                <button onClick={() => handleCollectionClick('bracelets')} className="hover:text-rosh-background transition-colors uppercase tracking-widest text-xs">Bracelets</button>
              </li>
              <li>
                <button onClick={() => handleCollectionClick('pendants')} className="hover:text-rosh-background transition-colors uppercase tracking-widest text-xs">Pendants</button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="flex flex-col">
            <h4 className="text-sm font-sans tracking-[0.2em] uppercase mb-6 text-rosh-background/80">Customer Care</h4>
            <ul className="flex flex-col gap-4 text-sm font-light text-rosh-background/60">
              <li>
                <Link to="/shop/faq" className="hover:text-rosh-background transition-colors">FAQ</Link>
              </li>
              <li>
                <Link to="/shop/terms" className="hover:text-rosh-background transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/shop/privacy" className="hover:text-rosh-background transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/shop/refund" className="hover:text-rosh-background transition-colors">Refund Policy</Link>
              </li>
              <li className="mt-2">
                <a href="mailto:support@ecommerce.com" className="hover:text-rosh-background transition-colors">support@ecommerce.com</a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Footer Bottom */}
      <div className="w-full border-t border-rosh-background/10">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-light text-rosh-background/40 tracking-widest">
          <p>&copy; {new Date().getFullYear()} Rosh Fine Jewellery. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Secured Payment</span>
            <span>Global Shipping</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
