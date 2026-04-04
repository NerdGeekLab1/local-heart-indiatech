
import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Youtube, Linkedin } from "lucide-react";

const Footer = () => (
  <footer className="bg-secondary border-t border-border">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
        <div className="col-span-2">
          <h4 className="text-lg font-bold text-primary mb-4">Travelista</h4>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Book a person, not just a place. Authentic India, one host at a time.
          </p>
          <div className="flex gap-3 mt-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
              <Youtube className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
        <div>
          <h5 className="text-sm font-semibold text-foreground mb-3">Explore</h5>
          <div className="space-y-2">
            <Link to="/explore" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Find Hosts</Link>
            <Link to="/experiences" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Experiences</Link>
            <Link to="/destinations" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Destinations</Link>
            <Link to="/trips" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Published Trips</Link>
            <Link to="/beta-wanderers" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Beta Wanderers</Link>
          </div>
        </div>
        <div>
          <h5 className="text-sm font-semibold text-foreground mb-3">Host</h5>
          <div className="space-y-2">
            <Link to="/become-host" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Become a Host</Link>
            <Link to="/host-trip" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Host a Trip</Link>
            <Link to="/dashboard/host" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Host Dashboard</Link>
            <Link to="/resources" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Host Resources</Link>
          </div>
        </div>
        <div>
          <h5 className="text-sm font-semibold text-foreground mb-3">Community</h5>
          <div className="space-y-2">
            <Link to="/community" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Traveler Stories</Link>
            <Link to="/community" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Host Spotlights</Link>
            <Link to="/community?tab=tips" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Travel Tips</Link>
            <Link to="/community?tab=blog" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
            <Link to="/docs" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Documentation</Link>
          </div>
        </div>
        <div>
          <h5 className="text-sm font-semibold text-foreground mb-3">Support</h5>
          <div className="space-y-2">
            <Link to="/help" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Help Center</Link>
            <Link to="/safety" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Safety</Link>
            <Link to="/grievances" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Grievance Resolution</Link>
            <Link to="/terms" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
            <Link to="/resources" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Resources</Link>
          </div>
        </div>
      </div>
      <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">© 2026 Travelista. All rights reserved.</p>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <Link to="/terms" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">Cookie Policy</Link>
          <Link to="/safety" className="hover:text-foreground transition-colors">Trust & Safety</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
