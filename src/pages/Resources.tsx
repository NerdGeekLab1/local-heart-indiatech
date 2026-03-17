import { motion } from "framer-motion";
import { BookOpen, Video, FileText, Download, ExternalLink, Shield, DollarSign, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const resources = [
  { icon: BookOpen, title: "Host Handbook", desc: "Complete guide to becoming a successful Travelista host — from setup to 5-star reviews.", category: "Getting Started" },
  { icon: Camera, title: "Photography Guide", desc: "Tips for capturing your property, experiences, and city in the best light.", category: "Getting Started" },
  { icon: DollarSign, title: "Pricing Strategy", desc: "How to set competitive prices that reflect your value and attract the right travelers.", category: "Business" },
  { icon: Video, title: "Video Testimonial Guide", desc: "Encourage and collect video testimonials from past travelers for your profile.", category: "Marketing" },
  { icon: Shield, title: "Safety Protocols", desc: "Emergency procedures, guest safety checklists, and KYC verification process.", category: "Safety" },
  { icon: FileText, title: "Tax & Legal Guide", desc: "Understanding GST, income reporting, and legal requirements for hosting in India.", category: "Business" },
];

const faqs = [
  { q: "How do I get verified?", a: "Complete KYC with government ID, address proof, and a video verification call. Takes 24-48 hours." },
  { q: "How are payments processed?", a: "Payments are held in escrow and released to your bank account 24 hours after guest check-in." },
  { q: "Can I set my own cancellation policy?", a: "Yes — choose from Flexible (free cancel 24h before), Moderate (free cancel 5 days before), or Strict (50% refund up to 7 days before)." },
  { q: "How do reviews work?", a: "Guests can leave reviews within 14 days of their experience. You can respond publicly to every review." },
];

const Resources = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Resources</h1>
        <p className="mt-2 text-muted-foreground">Everything you need to succeed as a host or travel smarter</p>
      </motion.div>

      {/* Resource Cards */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((r, i) => (
          <motion.div key={r.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
            className="rounded-lg bg-card p-6 shadow-card hover:shadow-card-hover transition-shadow">
            <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{r.category}</span>
            <div className="mt-3 w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
              <r.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="mt-3 font-bold text-foreground">{r.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
            <Button variant="ghost" size="sm" className="mt-3 text-primary text-xs px-0 hover:bg-transparent">
              Read More <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </motion.div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-16">
        <h2 className="text-xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map(f => (
            <div key={f.q} className="rounded-lg bg-card p-5 shadow-card">
              <h3 className="font-semibold text-foreground text-sm">{f.q}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Downloads */}
      <div className="mt-16 rounded-lg bg-primary/5 border border-primary/20 p-8 text-center">
        <h2 className="text-xl font-bold text-foreground">Download the Host Starter Kit</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">Get templates, checklists, and guides to launch your hosting journey.</p>
        <Button className="mt-4 rounded-full bg-primary text-primary-foreground gap-2">
          <Download className="w-4 h-4" /> Download Kit (PDF)
        </Button>
      </div>
    </div>
    <Footer />
  </div>
);

export default Resources;
