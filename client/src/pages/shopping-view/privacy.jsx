import { motion } from "framer-motion";
import { useEffect } from "react";
import Footer from "@/components/shopping-view/footer";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      title: "Consent",
      content: [
        "By using our website, you hereby consent to our Privacy Policy and agree to its terms."
      ]
    },
    {
      title: "Information we collect",
      content: [
        "The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.",
        "If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.",
        "When you register for an Account, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number."
      ]
    },
    {
      title: "How we use your information",
      content: [
        "We use the information we collect in various ways, including to:",
        "• Provide, operate, and maintain our website",
        "• Improve, personalize, and expand our website",
        "• Understand and analyze how you use our website",
        "• Develop new products, services, features, and functionality",
        "• Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes",
        "• Send you emails",
        "• Find and prevent fraud"
      ]
    },
    {
      title: "Log Files",
      content: [
        "Rosh Fine Jewellery follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information."
      ]
    },
    {
      title: "Advertising Partners Privacy Policies",
      content: [
        "You may consult this list to find the Privacy Policy for each of the advertising partners of Rosh Fine Jewellery.",
        "Third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on Rosh Fine Jewellery, which are sent directly to users' browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.",
        "Note that Rosh Fine Jewellery has no access to or control over these cookies that are used by third-party advertisers."
      ]
    },
    {
      title: "Third Party Privacy Policies",
      content: [
        "Rosh Fine Jewellery's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options. You may find a complete list of these Privacy Policies and their links here: Privacy Policy Links.",
        "You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers' respective websites. What Are Cookies?"
      ]
    },
    {
      title: "CCPA Privacy Rights",
      content: [
        "Under the CCPA, among other rights, California consumers have the right to:",
        "Request that a business that collects a consumer's personal data disclose the categories and specific pieces of personal data that a business has collected about consumers.",
        "Request that a business delete any personal data about the consumer that a business has collected.",
        "Request that a business that sells a consumer's personal data, not sell the consumer's personal data.",
        "If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us."
      ]
    },
    {
      title: "GDPR Data Protection Rights",
      content: [
        "We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:",
        "The right to access – You have the right to request copies of your personal data. We may charge you a small fee for this service.",
        "The right to rectification – You have the right to request that we correct any information you believe is inaccurate. You also have the right to request that we complete the information you believe is incomplete.",
        "The right to erasure – You have the right to request that we erase your personal data, under certain conditions.",
        "The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.",
        "The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions.",
        "The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.",
        "If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us."
      ]
    },
    {
      title: "Children's Information",
      content: [
        "Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.",
        "Rosh Fine Jewellery does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#EBE5DE] text-rosh-primary font-sans flex flex-col">
      <div className="flex-1 max-w-[1000px] w-full mx-auto px-6 md:px-12 py-20 md:py-32">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.33, 1, 0.68, 1] }}
          className="text-center mb-20 md:mb-24 mt-10 md:mt-0"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] font-medium mb-6 opacity-60">Legal</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif italic mb-8">Privacy Policy</h1>
          <p className="font-serif text-lg md:text-xl leading-relaxed text-rosh-primary/80 max-w-3xl mx-auto">
            At Rosh Fine Jewellery, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Rosh Fine Jewellery and how we use it.
          </p>
          <p className="font-serif text-lg md:text-xl leading-relaxed text-rosh-primary/80 max-w-3xl mx-auto mt-4">
            If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us. This Privacy Policy applies only to our online activities and is valid for visitors to our website with regards to the information that they shared and/or collect in Rosh Fine Jewellery. This policy is not applicable to any information collected offline or via channels other than this website.
          </p>
        </motion.div>

        {/* Content */}
        <div className="flex flex-col space-y-16 mb-20">
          {sections.map((section, sectionIndex) => (
            <motion.div 
              key={sectionIndex}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
              className="flex flex-col"
            >
              <h3 className="text-2xl md:text-3xl font-serif italic mb-6">
                {section.title}
              </h3>
              
              <div className="space-y-4">
                {section.content.map((paragraph, pIndex) => (
                  <p key={pIndex} className="text-rosh-primary/70 font-sans text-sm md:text-base leading-loose max-w-4xl">
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
      
      <Footer hideNewsletter />
    </div>
  );
};

export default PrivacyPolicy;
