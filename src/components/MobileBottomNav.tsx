import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Map, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/explore", icon: Compass, label: "Explore" },
  { to: "/trips", icon: Map, label: "Trips" },
  { to: "/community", icon: MessageCircle, label: "Messages" },
  { to: "/profile", icon: User, label: "Profile" },
];

const MobileBottomNav = () => {
  const location = useLocation();
  const { user, userRole } = useAuth();

  const dashboardPath = userRole === "admin" ? "/dashboard/admin" : userRole === "host" ? "/dashboard/host" : "/dashboard/traveler";

  const getProfileLink = () => user ? dashboardPath : "/signup";

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/profile") {
      return location.pathname.startsWith("/dashboard") || location.pathname === "/signup";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card/95 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-14 px-2">
        {navItems.map(item => {
          const to = item.to === "/profile" ? getProfileLink() : item.to;
          const active = isActive(item.to);
          return (
            <Link
              key={item.label}
              to={to}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-lg transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", active && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {active && <div className="w-4 h-0.5 bg-primary rounded-full" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
