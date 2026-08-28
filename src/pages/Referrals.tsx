import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import ReferralsPanel from "@/components/ReferralsPanel";

const Referrals = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4 max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-foreground">Referral Program</h1>
          <p className="text-muted-foreground mt-2">Sign in to access your referral dashboard</p>
          <Link to="/signup"><Button className="mt-4 rounded-full">Sign In</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <ReferralsPanel />
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Track everything alongside your trips in your{" "}
            <Link to="/dashboard/traveler?tab=referrals" className="text-primary hover:underline">traveler dashboard</Link>.
          </p>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Referrals;
