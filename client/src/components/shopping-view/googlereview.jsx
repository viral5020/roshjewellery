import React from 'react';
import { CheckCircle, Headphones, Shield, CreditCard } from 'lucide-react'; // Assuming you have these icons
import img from "../../assets/goog.png"; // Update the path to your image

const ReviewCard = ({ icon, title, description, iconColor }) => (
  <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md">
    <div className={`text-4xl mb-4 ${iconColor}`}>
      {icon} {/* Rendering Icon */}
    </div>
    <h3 className="text-xl font-semibold mb-4">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const GoogleReviewsSection = () => {
  return (
    <section className="bg-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <img
          src={img} // Assuming the image is imported or from a URL
          alt="Google logo"
          className="w-24 h-24 mx-auto" // Centers the image horizontally
        />
        <h2 className="text-4xl font-bold mt-4 mb-4">Google Reviews</h2>

        <div className="space-y-8">
          {/* Review 1 */}
          <div className="flex flex-col bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col items-center mb-4"> {/* Flex-col to stack items vertically */}
              {/* Rating Stars */}
              <div className="flex text-yellow-500">
                <span>⭐⭐⭐⭐⭐</span>
              </div>
              <p className="mt-2 font-bold text-lg">Sam Wilson</p> {/* Added mt-2 for spacing between stars and name */}
            </div>
            <p className="text-gray-700">
              "This place exceeded my expectations. The quality of the products and customer service is outstanding. I will definitely recommend it to my friends!"
            </p>
          </div>

          {/* New Section: 4 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-12">
            {/* Card 1 */}
            <ReviewCard 
              icon={<CheckCircle />} 
              title="100% Quality" 
              description="We guarantee the best quality in all our products."
              iconColor="text-green-500"
            />

            {/* Card 2 */}
            <ReviewCard 
              icon={<Headphones />} 
              title="Easy Customer" 
              description="Our customer service is fast and efficient for you."
              iconColor="text-blue-500"
            />

            {/* Card 3 */}
            <ReviewCard 
              icon={<Shield />} 
              title="Secure & Safe" 
              description="Your personal information is always protected with us."
              iconColor="text-green-500"
            />

            {/* Card 4 */}
            <ReviewCard 
              icon={<CreditCard />} 
              title="Multiple Payment" 
              description="We offer various payment methods for your convenience."
              iconColor="text-purple-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default GoogleReviewsSection;
