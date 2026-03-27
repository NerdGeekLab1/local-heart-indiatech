import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BookOpen, Video, FileText, Download, ExternalLink, Shield, DollarSign, Camera,
  Users, Globe, Star, ChevronRight, CheckCircle, Lightbulb, TrendingUp, MessageCircle, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const resourceCategories = [
  {
    title: "Getting Started",
    resources: [
      { icon: BookOpen, title: "Host Handbook", desc: "Complete guide from setup to earning 5-star reviews. Covers listing, pricing, and guest communication.", link: "#handbook", details: ["Creating your profile", "Setting up your space", "Writing compelling descriptions", "Photographing your property", "Setting competitive prices"] },
      { icon: Camera, title: "Photography Guide", desc: "Professional tips for capturing your property, experiences, and city.", link: "#photo", details: ["Lighting techniques", "Smartphone photography", "Editing with free tools", "Best angles for rooms", "Action shots for experiences"] },
      { icon: Users, title: "Guest Communication", desc: "Templates and tips for responding to inquiries, managing expectations.", link: "#guest-comm", details: ["Response templates", "Pre-arrival messages", "During-stay check-ins", "Post-stay follow-up", "Handling difficult guests"] },
    ]
  },
  {
    title: "Business & Finance",
    resources: [
      { icon: DollarSign, title: "Pricing Strategy", desc: "Dynamic pricing, seasonal adjustments, and competitor analysis.", link: "#pricing", details: ["Market research methods", "Seasonal pricing calendar", "Competitor benchmarking", "Discount strategies", "Premium pricing for peak seasons"] },
      { icon: FileText, title: "Tax & Legal Guide", desc: "GST compliance, income reporting, and legal requirements for hosting in India.", link: "#tax", details: ["GST registration", "Income tax filing", "Record keeping", "Insurance requirements", "Liability protection"] },
      { icon: TrendingUp, title: "Growth Playbook", desc: "Scale from 1 listing to multiple properties with data-driven strategies.", link: "#growth", details: ["Multi-property management", "Team building", "Automation tools", "Revenue optimization", "Expansion planning"] },
    ]
  },
  {
    title: "Marketing & Reviews",
    resources: [
      { icon: Video, title: "Video Content Guide", desc: "Create engaging videos for your listings and social media presence.", link: "#video", details: ["Equipment recommendations", "Storytelling techniques", "Editing tutorials", "Platform-specific formats", "Live streaming tips"] },
      { icon: Star, title: "Review Strategy", desc: "Earn consistently high ratings and handle feedback professionally.", link: "#reviews", details: ["Asking for reviews", "Responding to criticism", "Using feedback for improvement", "Showcase testimonials", "Video review collection"] },
      { icon: MessageCircle, title: "Social Media for Hosts", desc: "Build your brand on Instagram, YouTube, and travel forums.", link: "#social", details: ["Content calendar", "Hashtag strategy", "Engagement tactics", "Influencer collaborations", "User-generated content"] },
    ]
  },
  {
    title: "Safety & Compliance",
    resources: [
      { icon: Shield, title: "Safety Protocols", desc: "Emergency procedures, guest safety checklists, and fire safety.", link: "#safety", details: ["Emergency contacts setup", "Fire safety checklist", "First aid essentials", "Guest verification", "Property safety audit"] },
      { icon: Globe, title: "Cultural Sensitivity", desc: "Guide to welcoming guests from different cultures and backgrounds.", link: "#culture", details: ["Cultural dos and don'ts", "Dietary considerations", "Religious accommodations", "Language basics", "Inclusive hosting"] },
    ]
  },
];

const faqs = [
  { q: "How do I get verified?", a: "Complete KYC with government ID, address proof, and a video verification call. Takes 24-48 hours." },
  { q: "How are payments processed?", a: "Payments are held in escrow and released to your bank account 24 hours after guest check-in." },
  { q: "Can I set my own cancellation policy?", a: "Yes — choose from Flexible (free cancel 24h before), Moderate (free cancel 5 days before), or Strict (50% refund up to 7 days before)." },
  { q: "How do reviews work?", a: "Guests can leave reviews within 14 days of their experience. You can respond publicly to every review." },
  { q: "What commission does the platform take?", a: "We charge a 15% service fee on each booking. This covers payment processing, insurance, and 24/7 support." },
  { q: "Can I host multiple properties?", a: "Absolutely! Add unlimited properties and experiences from your host dashboard." },
];

const successStories = [
  { name: "Ravi", city: "Jaipur", quote: "Started with one room, now hosting 20+ guests monthly with 4.9 stars!", avatar: "R" },
  { name: "Priya", city: "Delhi", quote: "The photography guide doubled my booking inquiries within a month.", avatar: "P" },
  { name: "Meera", city: "Goa", quote: "Video testimonials from guests became my best marketing tool.", avatar: "M" },
];

const Resources = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-12">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
          className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Lightbulb className="w-8 h-8 text-primary" />
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Host Resources</h1>
        <p className="mt-2 text-lg text-muted-foreground">Everything you need to become a top-rated host</p>
      </motion.div>

      {/* Resource Categories */}
      {resourceCategories.map((cat, ci) => (
        <motion.section key={cat.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: ci * 0.1 }} className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full" />
            {cat.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cat.resources.map((r, i) => (
              <motion.div key={r.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}
                className="rounded-2xl bg-card p-6 shadow-card hover:shadow-elevated transition-all group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <r.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground">{r.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
                <div className="mt-4 space-y-1.5">
                  {r.details.slice(0, 3).map(d => (
                    <div key={d} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-accent shrink-0" /> {d}
                    </div>
                  ))}
                  {r.details.length > 3 && (
                    <p className="text-xs text-primary font-medium">+{r.details.length - 3} more topics</p>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="mt-3 text-primary text-xs px-0 hover:bg-transparent gap-1 group-hover:gap-2 transition-all">
                  Read Guide <ArrowRight className="w-3 h-3" />
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.section>
      ))}

      {/* Success Stories */}
      <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-12">
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-accent rounded-full" />
          Host Success Stories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {successStories.map(s => (
            <div key={s.name} className="rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 p-6 border border-primary/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{s.avatar}</div>
                <div>
                  <p className="font-bold text-foreground text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.city}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground italic">"{s.quote}"</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* FAQ */}
      <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-12">
        <h2 className="text-xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {faqs.map(f => (
            <div key={f.q} className="rounded-xl bg-card p-5 shadow-card">
              <h3 className="font-semibold text-foreground text-sm">{f.q}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-8 text-center">
        <h2 className="text-xl font-bold text-foreground">Ready to Start Hosting?</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">Download the complete starter kit or jump right in.</p>
        <div className="mt-4 flex gap-3 justify-center flex-wrap">
          <Button className="rounded-full gap-2">
            <Download className="w-4 h-4" /> Download Starter Kit
          </Button>
          <Link to="/become-host">
            <Button variant="outline" className="rounded-full gap-2">
              Become a Host <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default Resources;
