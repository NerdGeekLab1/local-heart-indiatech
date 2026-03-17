import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-secondary border-t border-border">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="text-lg font-bold text-primary mb-4">Travelista</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Book a person, not just a place. Authentic India, one host at a time.
          </p>
        </div>
        <div>
          <h5 className="text-sm font-semibold text-foreground mb-3">Explore</h5>
          <div className="space-y-2">
            <Link to="/explore" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Find Hosts</Link>
            <Link to="/experiences" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Experiences</Link>
            <Link to="/dashboard/traveler" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Traveler Dashboard</Link>
          </div>
        </div>
        <div>
          <h5 className="text-sm font-semibold text-foreground mb-3">Host</h5>
          <div className="space-y-2">
            <Link to="/become-host" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Become a Host</Link>
            <Link to="/dashboard/host" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Host Dashboard</Link>
            <Link to="/dashboard/admin" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Admin Panel</Link>
          </div>
        </div>
        <div>
          <h5 className="text-sm font-semibold text-foreground mb-3">Support</h5>
          <div className="space-y-2">
            <Link to="/help" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Help Center</Link>
            <Link to="/safety" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Safety</Link>
            <Link to="/terms" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </div>
      <div className="mt-10 pt-6 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">© 2026 Travelista. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
