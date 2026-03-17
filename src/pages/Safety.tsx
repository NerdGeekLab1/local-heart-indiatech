import { motion } from "framer-motion";
import { Shield, CheckCircle, Phone, Eye, Lock, Users, AlertTriangle, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Safety = () => {
  const features = [
    { icon: Shield, title: "KYC-Verified Hosts", desc: "Every host undergoes government ID verification, address proof, and a video interview before going live on the platform." },
    { icon: Eye, title: "Safety Scores", desc: "Each host has a transparent safety score (out of 100) based on verification level, reviews, response time, and track record." },
    { icon: Lock, title: "Secure Payments", desc: "All payments are held in escrow. Hosts receive funds only after your trip begins, giving you full protection." },
    { icon: Users, title: "Community Reviews", desc: "Read verified reviews from real travelers. We don't allow fake reviews and actively moderate all feedback." },
    { icon: Phone, title: "24/7 Emergency Support", desc: "Our support team is available around the clock. We have local emergency contacts in every major city." },
    { icon: Heart, title: "Travel Insurance", desc: "Optional travel insurance available at checkout. Covers medical emergencies, trip cancellations, and lost luggage." },
  ];

  const tips = [
    "Always communicate through the Travelista platform",
    "Video call your host before booking",
    "Share your itinerary with family/friends",
    "Check reviews and safety scores carefully",
    "Trust your instincts — if something feels off, contact us",
    "Keep emergency contacts saved in your phone",
    "Carry copies of important documents",
    "Register with your country's embassy in India",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Your Safety, Our Priority</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">Travelista is built on trust. Every layer of our platform is designed to keep you safe while connecting you with authentic experiences.</p>
        </motion.div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="rounded-lg bg-card p-6 shadow-card">
              <f.icon className="w-6 h-6 text-primary mb-3" />
              <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-12 rounded-lg bg-secondary p-8">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" /> Safety Tips for Travelers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tips.map(tip => (
              <div key={tip} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency */}
        <div className="mt-8 rounded-lg bg-primary/5 border border-primary/20 p-6 text-center">
          <h2 className="text-lg font-bold text-foreground">Emergency Contact</h2>
          <p className="text-muted-foreground mt-1">If you're in immediate danger, call local emergency services first.</p>
          <p className="mt-3 text-2xl font-bold text-primary">+91 1800 123 4567</p>
          <p className="text-sm text-muted-foreground">Travelista 24/7 Emergency Line</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Safety;
