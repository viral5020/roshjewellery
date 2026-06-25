import { useState } from "react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "@/components/shopping-view/footer";

function CustomWorkPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    number: "",
    email: "",
    type: "",
    budget: "",
    message: "",
    file: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let fileUrl = "";
      if (formData.file) {
        const uploadData = new FormData();
        uploadData.append("my_file", formData.file);
        const uploadRes = await axios.post("/api/admin/products/upload-image", uploadData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
        if (uploadRes.data?.success) {
          fileUrl = uploadRes.data.result.url;
        }
      }
      
      const response = await axios.post("/api/custom/create", {
        fullName: formData.fullName,
        number: formData.number,
        email: formData.email,
        type: formData.type,
        budget: parseFloat(formData.budget),
        message: formData.message,
        fileUrl: fileUrl,
      });

      if (response.data?.success) {
        toast({
          title: "Request Submitted",
          description: "Our design team will contact you shortly.",
          className: "bg-rosh-primary text-rosh-background border border-rosh-primary/20",
        });
        setFormData({
          fullName: "",
          number: "",
          email: "",
          type: "",
          budget: "",
          message: "",
          file: null,
        });
      } else {
        throw new Error(response.data?.message || "Submission failed");
      }
    } catch (error) {
      console.error("Custom order submission error:", error);
      toast({
        title: "Submission Error",
        description: error.message || "Failed to submit request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-rosh-background text-rosh-primary overflow-x-hidden font-sans">
      


      {/* Form Section */}
      <section className="py-16 md:py-24 px-6 md:px-12 w-full max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-rosh-primary/5 p-8 md:p-12 border border-rosh-primary/10 backdrop-blur-sm"
        >
          <div className="mb-10 text-center">
            <h2 className="text-2xl md:text-3xl font-serif tracking-wide mb-4 text-rosh-primary">Commission a Masterpiece</h2>
            <p className="text-rosh-primary/70 font-light text-sm md:text-base tracking-wide max-w-xl mx-auto leading-relaxed">
              From hand-selected diamonds to meticulously cast gold, detail your vision below. Our master artisans will work closely with you to craft an heirloom of unparalleled luxury.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Full Name */}
              <div className="space-y-3">
                <Label htmlFor="fullName" className="text-xs uppercase tracking-widest text-rosh-primary/80">Your Name *</Label>
                <Input 
                  id="fullName"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="bg-transparent border-0 border-b border-rosh-primary/20 rounded-none px-0 py-3 text-rosh-primary focus-visible:ring-0 focus-visible:border-rosh-highlight transition-colors placeholder:text-rosh-primary/30 h-auto"
                />
              </div>

              {/* Number */}
              <div className="space-y-3">
                <Label htmlFor="number" className="text-xs uppercase tracking-widest text-rosh-primary/80">Contact Number *</Label>
                <Input 
                  id="number"
                  name="number"
                  type="tel"
                  required
                  value={formData.number}
                  onChange={handleInputChange}
                  placeholder="+91 9876543210"
                  className="bg-transparent border-0 border-b border-rosh-primary/20 rounded-none px-0 py-3 text-rosh-primary focus-visible:ring-0 focus-visible:border-rosh-highlight transition-colors placeholder:text-rosh-primary/30 h-auto"
                />
              </div>

              {/* Email */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-xs uppercase tracking-widest text-rosh-primary/80">Email Address *</Label>
                <Input 
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  className="bg-transparent border-0 border-b border-rosh-primary/20 rounded-none px-0 py-3 text-rosh-primary focus-visible:ring-0 focus-visible:border-rosh-highlight transition-colors placeholder:text-rosh-primary/30 h-auto"
                />
              </div>

              {/* Select Type */}
              <div className="space-y-3">
                <Label htmlFor="type" className="text-xs uppercase tracking-widest text-rosh-primary/80">Jewellery Type *</Label>
                <select 
                  id="type"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-0 border-b border-rosh-primary/20 rounded-none px-0 py-3 text-rosh-primary focus:ring-0 focus:border-rosh-highlight transition-colors outline-none appearance-none cursor-pointer text-sm"
                >
                  <option value="" disabled className="text-rosh-primary">Select an option</option>
                  <option value="Pendant" className="text-rosh-primary">Pendant</option>
                  <option value="Ring" className="text-rosh-primary">Ring</option>
                  <option value="Necklace/Chain" className="text-rosh-primary">Necklace / Chain</option>
                  <option value="Bracelet" className="text-rosh-primary">Bracelet</option>
                  <option value="Earrings" className="text-rosh-primary">Earrings</option>
                  <option value="Grillz" className="text-rosh-primary">Grillz</option>
                  <option value="Other" className="text-rosh-primary">Other</option>
                </select>
              </div>

              {/* Budget */}
              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="budget" className="text-xs uppercase tracking-widest text-rosh-primary/80">Investment Range (Min. ₹25,000) *</Label>
                <div className="relative">
                  <span className="absolute left-0 top-3 text-rosh-primary/50 font-medium">₹</span>
                  <Input 
                    id="budget"
                    name="budget"
                    type="number"
                    min="25000"
                    required
                    value={formData.budget}
                    onChange={handleInputChange}
                    placeholder="25000"
                    className="bg-transparent border-0 border-b border-rosh-primary/20 rounded-none pl-6 py-3 text-rosh-primary focus-visible:ring-0 focus-visible:border-rosh-highlight transition-colors placeholder:text-rosh-primary/30 h-auto"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="message" className="text-xs uppercase tracking-widest text-rosh-primary/80">Your Vision & Specifications *</Label>
                <textarea 
                  id="message"
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Describe your vision, dimensions, preferred materials, etc."
                  className="w-full bg-transparent border-0 border-b border-rosh-primary/20 rounded-none px-0 py-3 text-rosh-primary focus-visible:ring-0 focus-visible:border-rosh-highlight transition-colors outline-none resize-y placeholder:text-rosh-primary/30 text-sm"
                />
              </div>

              {/* File Upload */}
              <div className="space-y-3 md:col-span-2">
                <Label className="text-xs uppercase tracking-widest text-rosh-primary/80 block mb-2">Inspiration & Reference Images (Optional)</Label>
                <div className="relative border border-dashed border-rosh-primary/30 transition-colors cursor-pointer overflow-hidden p-8 flex flex-col items-center justify-center bg-rosh-primary/5">
                  <Input 
                    type="file" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept="image/*"
                  />
                  {formData.file ? (
                    <div className="flex flex-col items-center text-rosh-highlight">
                      <CheckCircle2 className="w-8 h-8 mb-3" />
                      <span className="text-sm tracking-wide font-light truncate max-w-[200px]">{formData.file.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-rosh-primary/60 transition-colors">
                      <UploadCloud className="w-8 h-8 mb-3" strokeWidth={1.5} />
                      <span className="text-sm tracking-wide font-light text-center">Click or drag images to upload<br/>(PNG, JPG, PDF)</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            <div className="pt-8">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-14 rounded-none bg-rosh-primary text-rosh-background hover:bg-rosh-highlight hover:text-rosh-background hover:scale-[1.01] transition-all duration-300 font-sans tracking-widest uppercase text-sm"
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>

        </motion.div>
      </section>

      <Footer hideNewsletter={true} />
    </div>
  );
}

export default CustomWorkPage;
