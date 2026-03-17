import { motion } from "framer-motion";
import { Search, MessageCircle, Phone, Mail, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const faqs = [
  { q: "How do I book a host?", a: "Browse our Explore page, find a host you connect with, and click 'Inquire Now'. Select your dates, services, and send a message. Your host will respond within their stated response time." },
  { q: "How are hosts verified?", a: "Every host goes through KYC (Know Your Customer) verification including government ID check, address verification, and a video interview. We also collect reviews from past travelers." },
  { q: "What payment methods are accepted?", a: "We accept all major credit/debit cards, PayPal, and bank transfers. Payments are held in escrow and released to hosts after your trip begins." },
  { q: "Can I cancel my booking?", a: "Yes. Free cancellation up to 7 days before your trip. 50% refund for cancellations 3-7 days before. No refund for cancellations less than 3 days before." },
  { q: "Is it safe to stay with a local host?", a: "Safety is our top priority. All hosts are KYC-verified, have safety scores, and we maintain 24/7 emergency support. We also encourage video calls before booking." },
  { q: "How do I become a host?", a: "Visit our 'Become a Host' page and fill out the application. We'll review it within 48 hours, conduct KYC verification, and once approved, your profile goes live!" },
  { q: "What if I have an issue during my trip?", a: "Contact our 24/7 support team via the app, email, or phone. We have local teams in major cities who can assist in emergencies." },
  { q: "Are meals included?", a: "It depends on the host and experience. Many homestays include meals. Check the specific listing details or ask your host during the inquiry stage." },
];

const HelpCenter = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filtered = faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">How can we help?</h1>
          <p className="mt-2 text-muted-foreground">Find answers to common questions or reach out to our team</p>
        </motion.div>

        <div className="mt-8 relative max-w-lg mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search for help..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-full bg-card shadow-card pl-11 pr-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>

        {/* Contact Cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: MessageCircle, title: "Live Chat", desc: "Available 24/7", action: "Start Chat" },
            { icon: Mail, title: "Email Us", desc: "support@travelista.com", action: "Send Email" },
            { icon: Phone, title: "Call Us", desc: "+91 1800 123 4567", action: "Call Now" },
          ].map(c => (
            <div key={c.title} className="rounded-lg bg-card p-5 shadow-card text-center">
              <c.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-foreground">{c.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{c.desc}</p>
              <Button size="sm" variant="outline" className="mt-3 rounded-full text-xs">{c.action}</Button>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {filtered.map((faq, i) => (
              <div key={i} className="rounded-lg bg-card shadow-card overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                  <span className="font-medium text-foreground text-sm">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HelpCenter;
