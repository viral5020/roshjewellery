import React from "react";
import { Facebook, Twitter, Instagram, GitHub } from "lucide-react";  // Assuming you're using lucide-react icons

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-screen-xl mx-auto px-4">
        {/* Footer Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Navigation Links */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
            <ul>
              <li>
                <a href="/shop/home" className="hover:underline">Home</a>
              </li>
              <li>
                <a href="/shop/products" className="hover:underline">Products</a>
              </li>
              <li>
                <a href="/shop/about" className="hover:underline">About Us</a>
              </li>
              <li>
                <a href="/shop/contact" className="hover:underline">Contact</a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Contact Us</h4>
            <ul>
              <li>Email: <a href="mailto:support@ecommerce.com" className="hover:underline">support@ecommerce.com</a></li>
              <li>Phone: <a href="tel:+123456789" className="hover:underline">+1 (234) 567-89</a></li>
            </ul>
          </div>

          {/* Social Media Links */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <Facebook className="h-6 w-6 hover:text-blue-600" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <Twitter className="h-6 w-6 hover:text-blue-400" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-6 w-6 hover:text-pink-500" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <GitHub className="h-6 w-6 hover:text-gray-700" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Section */}
        <div className="mt-8 border-t border-gray-600 pt-4 text-center">
          <p className="text-sm">&copy; Ecommerce</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
