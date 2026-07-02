import { Button } from "@/components/ui/button";
import { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  setProductDetails
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import { getFeatureImages } from "@/store/common-slice";
import Footer from "@/components/shopping-view/footer";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight, Star, Award, Sparkles, ShieldCheck, Infinity } from "lucide-react";
import { Instagram } from "lucide-react";

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

function ShoppingHome() {
  const { productList } = useSelector((state) => state.shopProducts);
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const { currency, exchangeRates } = useSelector((state) => state.currency);
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [heroImage, setHeroImage] = useState("");
  const categorySliderRef = useRef(null);
  const aboutUsCarouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#about') {
      setTimeout(() => {
        const element = document.getElementById('about');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  }, [location]);

  const [dbSubcategories, setDbSubcategories] = useState([]);

  useEffect(() => {
    fetch('/api/subcategories')
      .then(res => res.json())
      .then(data => setDbSubcategories(data.subcategories || []))
      .catch(console.error);
  }, []);

  const handleScroll = () => {
    if (categorySliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categorySliderRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  const scrollCategories = (dir) => {
    if (categorySliderRef.current) {
      categorySliderRef.current.scrollBy({
        left: dir === 'left' ? -350 : 350,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    dispatch(setProductDetails());
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
      })
    );
    dispatch(getFeatureImages());
  }, [dispatch]);

  useEffect(() => {
    if (featureImageList && featureImageList.length > 0) {
      const banner = featureImageList.find(img => !img.type || img.type === 'banner');
      if (banner) {
        setHeroImage(banner.image);
      } else {
        setHeroImage(featureImageList[0]?.image);
      }
    }
  }, [featureImageList]);

  const handleNavigateToListingPage = (filterSection, filterValue) => {
    sessionStorage.removeItem("filters");
    let filterId = filterValue;

    if (filterSection === 'subcategories') {
      const subcat = dbSubcategories.find(s => s.name.toLowerCase() === filterValue.toLowerCase());
      if (subcat) {
        filterId = subcat._id;
      }
    }

    const currentFilter = {
      [filterSection]: [filterId],
    };
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate("/shop/listing");
  };

  const handleGetProductDetails = (getCurrentProductId) => {
    navigate(`/product-details/${getCurrentProductId}`);
  };

  const handleAddtoCart = (getCurrentProductId) => {
    dispatch(
      addToCart({
        userId: user?.id || null,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id || null));
        toast({ title: "Product is added to cart" });
      }
    });
  };

  const convertPrice = (price) => {
    if (!exchangeRates || !currency || !exchangeRates[currency]) return price;
    return (price * exchangeRates[currency]).toFixed(2);
  };

  const bestSellers = productList ? productList.filter((product) => product.isBestSeller) : [];
  const newArrivals = productList ? productList.filter((product) => product.isNewArrival) : [];

  // Dynamic images from product list to avoid stock photos
  const dynamicGalleryImages = productList && productList.length > 0
    ? bestSellers.map(p => p.image)
    : [heroImage, heroImage, heroImage, heroImage];
  const getCuratedFeatureImage = (categoryType) => {
    return featureImageList?.find(img => img.type === categoryType)?.image;
  };

  const staticImages = {
    earring: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600",
    pendant: "https://images.unsplash.com/photo-1599643478518-a854e5da4cfa?q=80&w=600",
    ring: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600",
    cuff: "https://images.unsplash.com/photo-1611652022419-a9419f74a43d?q=80&w=600",
    bracelet: "https://images.unsplash.com/photo-1611591430281-7c3e2b196a68?q=80&w=600",
    chain: "https://images.unsplash.com/photo-1599643478518-a854e5da4cfa?q=80&w=600",
    link: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?q=80&w=600",
    anklet: "https://images.unsplash.com/photo-1573408301185-98516138618a?q=80&w=600",
  };

  const categories = [
    { id: 'earrings', label: 'Earrings', image: getCuratedFeatureImage('curated_earrings') || staticImages.earring },
    { id: 'pendants', label: 'Pendants', image: getCuratedFeatureImage('curated_pendants') || staticImages.pendant },
    { id: 'rings', label: 'Rings', image: getCuratedFeatureImage('curated_rings') || staticImages.ring },
    { id: 'cuffs', label: 'Cuffs', image: getCuratedFeatureImage('curated_cuffs') || staticImages.cuff },
    { id: 'bracelets', label: 'Bracelets', image: getCuratedFeatureImage('curated_bracelets') || staticImages.bracelet },
    { id: 'chains', label: 'Chains', image: getCuratedFeatureImage('curated_chains') || staticImages.chain },
    { id: 'cufflinks', label: 'Cufflinks', image: getCuratedFeatureImage('curated_cufflinks') || staticImages.link },
    { id: 'anklets', label: 'Anklets', image: getCuratedFeatureImage('curated_anklets') || staticImages.anklet },
  ];

  const aboutUsImages = featureImageList?.filter(img => img.type === 'aboutUs') || [];
  const storyImgFallback = productList && productList.length > 3 ? productList[3].image : heroImage;

  useEffect(() => {
    if (aboutUsImages.length <= 1) return;
    
    const interval = setInterval(() => {
      if (aboutUsCarouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = aboutUsCarouselRef.current;
        
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          aboutUsCarouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          aboutUsCarouselRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
        }
      }
    }, 4000); 

    return () => clearInterval(interval);
  }, [aboutUsImages]);

  return (
    <div className="flex flex-col min-h-screen bg-rosh-background text-rosh-primary overflow-x-hidden font-sans">

      {/* 1. Premium Hero Section */}
      <section className="relative w-full h-[90vh] md:h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-rosh-primary">
          {heroImage && (
            heroImage.match(/\.(mp4|webm|ogg|mov)$/i) || heroImage.includes('/video/') ? (
              <motion.video
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                src={heroImage}
                className="w-full h-full object-cover opacity-80"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <motion.img
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                src={heroImage}
                alt="Hero Campaign"
                className="w-full h-full object-cover opacity-80"
              />
            )
          )}
          <div className="absolute inset-0 bg-rosh-primary/40 mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-4xl md:text-[80px] leading-tight text-rosh-background mb-4 md:mb-6"
          >
            Crafted To Be <br /><span className="italic text-rosh-highlight">Treasured Forever</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-sm md:text-[18px] text-rosh-background/90 mb-6 md:mb-10 max-w-2xl px-4"
          >
            Fine jewellery designed with timeless elegance, exceptional craftsmanship, and modern luxury.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-3 md:gap-6 w-full sm:w-auto px-8 sm:px-0"
          >
            <button
              onClick={() => navigate('/shop/listing')}
              className="w-full sm:w-auto px-6 py-3 md:px-10 md:py-4 text-xs md:text-sm bg-rosh-background text-rosh-primary uppercase tracking-widest hover:bg-rosh-highlight hover:text-rosh-background transition-colors duration-300"
            >
              Shop Collection
            </button>
            <button
              onClick={() => navigate('/shop/new-arrivals')}
              className="w-full sm:w-auto px-6 py-3 md:px-10 md:py-4 text-xs md:text-sm border border-rosh-background text-rosh-background uppercase tracking-widest hover:bg-rosh-background/10 transition-colors duration-300"
            >
              Explore New Arrivals
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. The Collections */}
      <section className="py-16 md:py-24 w-full">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
          <div className="mb-10 md:mb-12 text-left">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUpVariant}
            >
              <h2 className="uppercase text-rosh-primary mb-2">Curated by Form</h2>
              <p className="text-rosh-primary/60 font-light text-sm tracking-wide">Explore our signature categories designed to elevate your everyday.</p>
            </motion.div>
          </div>
        </div>

        <div className="relative max-w-[1600px] mx-auto group/slider">
          {canScrollLeft && (
            <button
              onClick={() => scrollCategories('left')}
              className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 -mt-6 z-10 w-12 h-12 bg-rosh-background/90 text-rosh-primary flex items-center justify-center rounded-full opacity-100 md:opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 hover:bg-rosh-primary hover:text-rosh-background shadow-lg"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={() => scrollCategories('right')}
              className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 -mt-6 z-10 w-12 h-12 bg-rosh-background/90 text-rosh-primary flex items-center justify-center rounded-full opacity-100 md:opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 hover:bg-rosh-primary hover:text-rosh-background shadow-lg"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          <motion.div
            ref={categorySliderRef}
            onScroll={handleScroll}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="flex overflow-x-auto px-4 md:px-8 pb-12 gap-4 md:gap-6 snap-x snap-mandatory hide-scrollbar scroll-smooth"
          >
            {categories.map((cat, index) => (
              <motion.div
                key={cat.id}
                variants={fadeUpVariant}
                className="group relative overflow-hidden cursor-pointer bg-rosh-primary shrink-0 w-[220px] md:w-[280px] aspect-[4/5] snap-center"
                onClick={() => handleNavigateToListingPage('subcategories', cat.label)}
              >
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rosh-primary/90 via-rosh-primary/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-8">
                  <h3 className="text-rosh-background text-lg md:text-xl uppercase tracking-[0.2em] mb-2">{cat.label}</h3>
                  <span className="opacity-100 translate-y-0 md:opacity-0 md:translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 flex items-center text-rosh-highlight text-xs tracking-widest uppercase">
                    Discover <ArrowRight className="w-3 h-3 ml-2" />
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. Brand Story Section */}
      <section id="about" className="py-16 md:py-24 bg-rosh-primary text-rosh-background">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-16">
          <motion.div
            ref={aboutUsCarouselRef}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="md:w-1/2 flex overflow-x-auto snap-x hide-scrollbar gap-4 scroll-smooth"
          >
            {aboutUsImages.length > 0 ? (
              aboutUsImages.map((img) => (
                <img key={img._id} src={img.image} alt="Brand Craftsmanship" className="w-full shrink-0 snap-center h-auto aspect-[4/5] object-cover opacity-90" />
              ))
            ) : storyImgFallback && (
              <img src={storyImgFallback} alt="Brand Craftsmanship" className="w-full shrink-0 snap-center h-auto aspect-[4/5] object-cover opacity-90" />
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="md:w-1/2 flex flex-col justify-center"
          >
            <div className="text-rosh-secondary text-sm uppercase tracking-widest mb-6">Our Philosophy</div>
            <h2 className="mb-8">The Art of <br />Modern Heirloom</h2>
            <p className="text-rosh-background/80 mb-8 font-light leading-relaxed">
              Every piece of Rosh fine jewellery is a testament to extraordinary craftsmanship and timeless design. We believe in creating pieces that transcend seasons—modern heirlooms crafted with ethically sourced materials designed to be cherished for generations.
            </p>
            <button
              onClick={() => navigate('/shop/custom')}
              className="self-start pb-2 border-b border-rosh-highlight text-rosh-highlight uppercase tracking-widest text-xs hover:text-rosh-background hover:border-rosh-background transition-colors duration-300"
            >
              customize your product
            </button>
          </motion.div>
        </div>
      </section>

      {/* 4. Best Sellers */}
      <section className="py-16 md:py-24 px-6 md:px-12 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 gap-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariant}
          >
            <h2 className="uppercase text-rosh-primary mb-2">Bestsellers</h2>
            <p className="text-rosh-primary/60 font-light text-sm tracking-wide">The 'It' pieces everyone is obsessing over.</p>
          </motion.div>
          <button
            onClick={() => navigate('/shop/best-sellers')}
            className="hidden md:flex pb-1 border-b border-rosh-primary text-rosh-primary uppercase tracking-widest text-xs hover:text-rosh-accent hover:border-rosh-accent transition-colors"
          >
            View All
          </button>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
        >
          {bestSellers.map((productItem) => (
            <motion.div key={productItem._id} variants={fadeUpVariant} className="group">
              <ShoppingProductTile
                handleGetProductDetails={handleGetProductDetails}
                product={productItem}
                handleAddtoCart={handleAddtoCart}
                currency={currency}
                exchangeRates={exchangeRates}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 5. New Arrivals */}
      <section className="py-16 md:py-24 bg-[#EBE5DE] w-full">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 gap-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUpVariant}
            >
              <h2 className="uppercase text-rosh-primary mb-2">New Arrivals</h2>
              <p className="text-rosh-primary/60 font-light text-sm tracking-wide">Be the first to wear our newest designs.</p>
            </motion.div>
            <button
              onClick={() => navigate('/shop/new-arrivals')}
              className="hidden md:flex pb-1 border-b border-rosh-primary text-rosh-primary uppercase tracking-widest text-xs hover:text-rosh-accent hover:border-rosh-accent transition-colors"
            >
              Shop New In
            </button>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 items-start"
          >
            {newArrivals.map((productItem) => (
              <motion.div key={productItem._id} variants={fadeUpVariant} className="group">
                <ShoppingProductTile
                  handleGetProductDetails={handleGetProductDetails}
                  product={productItem}
                  handleAddtoCart={handleAddtoCart}
                  currency={currency}
                  exchangeRates={exchangeRates}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 6. Why Choose Rosh */}
      <section className="py-16 md:py-24 px-6 md:px-12 max-w-[1400px] mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 text-center"
        >
          {[{
            icon: Award,
            title: "Certified Authenticity",
            desc: "Every diamond and gemstone is strictly certified for quality and ethical sourcing."
          }, {
            icon: Sparkles,
            title: "Premium Craftsmanship",
            desc: "Handcrafted by master artisans ensuring every detail is perfectly executed."
          }, {
            icon: ShieldCheck,
            title: "Secure Delivery",
            desc: "Fully insured, complimentary shipping in discreet premium packaging."
          }, {
            icon: Infinity,
            title: "Lifetime Elegance",
            desc: "Complimentary cleaning and lifelong care services for your treasured pieces."
          }].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div key={i} variants={fadeUpVariant} className="flex flex-col items-center group cursor-default">
                <div className="relative w-16 h-16 mb-8 flex items-center justify-center rounded-full bg-rosh-primary/5 group-hover:bg-rosh-primary transition-colors duration-500">
                  <div className="absolute inset-0 rounded-full border border-rosh-primary/10 group-hover:scale-110 group-hover:border-rosh-accent transition-all duration-700"></div>
                  <Icon className="w-7 h-7 text-rosh-primary group-hover:text-rosh-highlight transition-colors duration-500 stroke-[1.5]" />
                </div>
                <h4 className="mb-3 text-rosh-primary uppercase tracking-[0.15em] text-sm md:text-base font-medium">{feature.title}</h4>
                <p className="text-sm font-light text-rosh-primary/60 tracking-wide leading-relaxed max-w-[260px]">{feature.desc}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </section>




      {/* 9 & 10. Newsletter and Footer are combined in Footer Component */}
      <Footer />

      {/* Style for hide-scrollbar */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}

export default ShoppingHome;
