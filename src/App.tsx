import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import Explore from "./pages/Explore.tsx";
import Experiences from "./pages/Experiences.tsx";
import ExperienceDetail from "./pages/ExperienceDetail.tsx";
import HostProfile from "./pages/HostProfile.tsx";
import Booking from "./pages/Booking.tsx";
import BecomeHost from "./pages/BecomeHost.tsx";
import Signup from "./pages/Signup.tsx";
import Destinations from "./pages/Destinations.tsx";
import DestinationDetail from "./pages/DestinationDetail.tsx";
import Community from "./pages/Community.tsx";
import Resources from "./pages/Resources.tsx";
import ResourceGuide from "./pages/ResourceGuide.tsx";
import TravelerDashboard from "./pages/dashboard/TravelerDashboard.tsx";
import HostDashboard from "./pages/dashboard/HostDashboard.tsx";
import AdminDashboard from "./pages/dashboard/AdminDashboard.tsx";
import HelpCenter from "./pages/HelpCenter.tsx";
import Safety from "./pages/Safety.tsx";
import Terms from "./pages/Terms.tsx";
import Docs from "./pages/Docs.tsx";
import HostTrip from "./pages/HostTrip.tsx";
import Grievances from "./pages/Grievances.tsx";
import BikeToursDetail from "./pages/BikeToursDetail.tsx";
import Trips from "./pages/Trips.tsx";
import TripDetail from "./pages/TripDetail.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/experiences" element={<Experiences />} />
            <Route path="/experience/:id" element={<ExperienceDetail />} />
            <Route path="/host/:id" element={<HostProfile />} />
            <Route path="/book/:id" element={<Booking />} />
            <Route path="/become-host" element={<BecomeHost />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/destination/:name" element={<DestinationDetail />} />
            <Route path="/community" element={<Community />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resource/:slug" element={<ResourceGuide />} />
            <Route path="/dashboard/traveler" element={<TravelerDashboard />} />
            <Route path="/dashboard/host" element={<HostDashboard />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/safety" element={<Safety />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/host-trip" element={<HostTrip />} />
            <Route path="/grievances" element={<Grievances />} />
            <Route path="/bike-tours" element={<BikeToursDetail />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/trip/:id" element={<TripDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
