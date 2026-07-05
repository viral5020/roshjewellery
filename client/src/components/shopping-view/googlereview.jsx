import React from 'react';
import { CheckCircle, Headphones, Shield, CreditCard, Star } from 'lucide-react';
import img from "../../assets/goog.png"; 
import { motion } from "framer-motion";

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const ReviewCard = ({ icon: Icon, title, description }) => (
  <motion.div variants={fadeUpVariant} className="flex flex-col items-center group cursor-default">
    <div className="relative w-16 h-16 mb-8 flex items-center justify-center rounded-full bg-rosh-primary/5 group-hover:bg-rosh-primary transition-colors duration-500">
      <div className="absolute inset-0 rounded-full border border-rosh-primary/10 group-hover:scale-110 group-hover:border-rosh-accent transition-all duration-700"></div>
      <Icon className="w-7 h-7 text-rosh-primary group-hover:text-rosh-highlight transition-colors duration-500 stroke-[1.5]" />
    </div>
    <h4 className="mb-3 text-rosh-primary uppercase tracking-[0.15em] text-sm md:text-base font-medium">{title}</h4>
    <p className="text-sm font-light text-rosh-primary/60 tracking-wide leading-relaxed max-w-[260px] text-center">{description}</p>
  </motion.div>
);

const GoogleReviewsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-[#EBE5DE] w-full">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 text-center">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUpVariant}
          className="flex flex-col items-center mb-12"
        >
          <img
            src={img}
            alt="Google logo"
            className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 object-contain"
          />
          <h2 className="uppercase text-rosh-primary mb-2 text-2xl md:text-3xl font-medium tracking-wide">Google Reviews</h2>
          <p className="text-rosh-primary/60 font-light text-sm tracking-wide">See what our clients say about us.</p>
        </motion.div>

        <div className="space-y-16">
          {/* Review 1 */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariant}
            className="flex flex-col items-center max-w-2xl mx-auto bg-rosh-background p-8 md:p-12 border border-rosh-primary/10 shadow-sm"
          >
            <div className="flex flex-col items-center mb-6">
              {/* Rating Stars */}
              <div className="flex text-rosh-highlight mb-3 gap-1">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="font-medium text-rosh-primary uppercase tracking-widest text-sm">Sam Wilson</p>
            </div>
            <p className="text-rosh-primary/80 font-light leading-relaxed italic text-center md:text-lg">
              "This place exceeded my expectations. The quality of the products and customer service is outstanding. I will definitely recommend it to my friends!"
            </p>
          </motion.div>

          {/* 4 Cards */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 mt-16 md:mt-24 pt-16 border-t border-rosh-primary/10"
          >
            <ReviewCard 
              icon={CheckCircle} 
              title="100% Quality" 
              description="We guarantee the best quality in all our products."
            />
            <ReviewCard 
              icon={Headphones} 
              title="Easy Customer" 
              description="Our customer service is fast and efficient for you."
            />
            <ReviewCard 
              icon={Shield} 
              title="Secure & Safe" 
              description="Your personal information is always protected with us."
            />
            <ReviewCard 
              icon={CreditCard} 
              title="Multiple Payment" 
              description="We offer various payment methods for your convenience."
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GoogleReviewsSection;
