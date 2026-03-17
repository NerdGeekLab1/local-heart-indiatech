import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: "By accessing and using Travelista, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using the platform."
  },
  {
    title: "2. User Accounts",
    content: "You must provide accurate, current, and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials. You must be at least 18 years old to create an account. You agree to notify us immediately of any unauthorized use of your account."
  },
  {
    title: "3. Host Responsibilities",
    content: "Hosts must complete KYC verification before listing services. Hosts are responsible for the accuracy of their listings, including pricing, availability, and descriptions. Hosts must comply with all local laws regarding tourism, homestays, and transportation. Hosts must maintain the safety standards outlined in our Host Guidelines."
  },
  {
    title: "4. Traveler Responsibilities",
    content: "Travelers must respect the local culture, customs, and property of hosts. Travelers must follow the itinerary agreed upon with hosts. Travelers must carry valid identification and travel documents. Travelers are responsible for their own travel insurance."
  },
  {
    title: "5. Booking & Payments",
    content: "All bookings are subject to host confirmation. Payments are processed securely through our platform. Platform commission is 15% per booking. Refunds are subject to our cancellation policy: full refund for cancellations 7+ days before, 50% refund for 3-7 days, and no refund for less than 3 days."
  },
  {
    title: "6. Cancellation Policy",
    content: "Free cancellation up to 7 days before the trip start date. 50% refund for cancellations between 3-7 days before the trip. No refund for cancellations less than 3 days before the trip. Hosts may cancel up to 48 hours before the trip with prior notice."
  },
  {
    title: "7. Content & Reviews",
    content: "Users may post reviews, photos, and videos. All content must be truthful and not violate any laws. We reserve the right to remove content that is offensive, misleading, or violates these terms. Fake reviews are strictly prohibited and may result in account termination."
  },
  {
    title: "8. Privacy & Data",
    content: "We collect and process personal data as described in our Privacy Policy. We use industry-standard encryption for all data transmission. Your data will not be shared with third parties without your consent, except as required by law."
  },
  {
    title: "9. Limitation of Liability",
    content: "Travelista acts as a marketplace connecting travelers with hosts. We are not liable for the actions, omissions, or negligence of hosts or travelers. We do not guarantee the quality, safety, or legality of listed services. Our liability is limited to the amount paid through the platform for the specific booking in question."
  },
  {
    title: "10. Contact",
    content: "For questions about these terms, contact us at legal@travelista.com or write to: Travelista Legal Team, 123 Startup Lane, Bangalore, Karnataka 560001, India."
  },
];

const Terms = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Terms of Service</h1>
        <p className="mt-2 text-muted-foreground">Last updated: March 1, 2026</p>
      </motion.div>

      <div className="mt-10 space-y-8">
        {sections.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-lg font-bold text-foreground">{s.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.content}</p>
          </motion.div>
        ))}
      </div>
    </div>
    <Footer />
  </div>
);

export default Terms;
