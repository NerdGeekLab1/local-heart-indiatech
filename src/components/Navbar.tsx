import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Menu, X, Compass, User, LogOut, Settings, LayoutDashboard, HelpCircle, FileText, ChevronDown, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import NotificationPanel from "@/components/NotificationPanel";

const navLinks = [
  { to: "/explore", label: "Explore" },
  { to: "/experiences", label: "Experiences" },
  { to: "/destinations", label: "Destinations" },
  { to: "/trips", label: "Trips", icon: Compass },
  { to: "/beta-wanderers", label: "🧭 Wanderers" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const { user, userRole, signOut } = useAuth();
  const { toast } = useToast();

  const dashboardPath = userRole === "admin" ? "/dashboard/admin" : userRole === "host" ? "/dashboard/host" : "/dashboard/traveler";

  const userInitials = user?.user_metadata?.first_name
    ? `${user.user_metadata.first_name[0]}${user.user_metadata.last_name?.[0] || ""}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out successfully" });
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${isHome ? "bg-transparent" : "bg-card/80 backdrop-blur-xl shadow-card"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-primary">Travelista</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive(link.to)
                    ? "text-primary bg-primary/10"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {link.icon && <link.icon className="w-3.5 h-3.5" />}
                {link.label}
              </Link>
            ))}
            <Link
              to="/become-host"
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive("/become-host")
                  ? "text-primary bg-primary/10"
                  : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Become a Host
            </Link>
          </div>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="h-4 w-4" />
            </Button>
            <ThemeToggle />
            <CurrencySwitcher />

            {user ? (
              <div className="flex items-center gap-2">
                <NotificationPanel />

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-full gap-2 pl-1.5 pr-3 h-10">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">{userInitials}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground hidden xl:block">
                        {user.user_metadata?.first_name || "Account"}
                      </span>
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium">{user.user_metadata?.first_name} {user.user_metadata?.last_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full w-fit capitalize">{userRole || "traveler"}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(dashboardPath)} className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`${dashboardPath}?tab=settings`)} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" /> My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`${dashboardPath}?tab=settings`)} className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" /> Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/help")} className="cursor-pointer">
                      <HelpCircle className="mr-2 h-4 w-4" /> Help Center
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/terms")} className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" /> Terms & Safety
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/signup">
                  <Button variant="ghost" className="rounded-full px-4 text-sm">Log In</Button>
                </Link>
                <Link to="/signup">
                  <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 text-sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <CurrencySwitcher />
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(dashboardPath)}><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/help")}><HelpCircle className="mr-2 h-4 w-4" /> Help</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive"><LogOut className="mr-2 h-4 w-4" /> Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-card/95 backdrop-blur-xl border-t border-border">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block py-2.5 px-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive(link.to) ? "text-primary bg-primary/10" : "text-foreground/80 hover:bg-muted/50"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/become-host" className="block py-2.5 px-3 text-sm font-medium rounded-lg" onClick={() => setMobileOpen(false)}>Become a Host</Link>
              <Link to="/host-trip" className="block py-2.5 px-3 text-sm font-medium rounded-lg" onClick={() => setMobileOpen(false)}>Host a Trip</Link>
              <Link to="/community" className="block py-2.5 px-3 text-sm font-medium rounded-lg" onClick={() => setMobileOpen(false)}>Community</Link>
              <Link to="/grievances" className="block py-2.5 px-3 text-sm font-medium rounded-lg" onClick={() => setMobileOpen(false)}>Grievances</Link>
              <div className="pt-2 border-t border-border mt-2">
                {!user && (
                  <Link to="/signup" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full rounded-full bg-primary text-primary-foreground">Sign Up / Log In</Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
