import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${isHome ? "bg-transparent" : "bg-card/80 backdrop-blur-xl shadow-card"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-primary">Travelista</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/explore" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              Explore
            </Link>
            <Link to="/experiences" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              Experiences
            </Link>
            <Link to="/become-host" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              Become a Host
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Globe className="h-4 w-4" />
            </Button>
            <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6">
              Sign Up
            </Button>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card/95 backdrop-blur-xl border-t border-border"
          >
            <div className="px-4 py-4 space-y-3">
              <Link to="/explore" className="block py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>Explore</Link>
              <Link to="/experiences" className="block py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>Experiences</Link>
              <Link to="/become-host" className="block py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>Become a Host</Link>
              <Button className="w-full rounded-full bg-primary text-primary-foreground">Sign Up</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
