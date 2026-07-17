import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import MobileBottomNav from "@/components/MobileBottomNav.tsx";
import AIChatRecommender from "@/components/AIChatRecommender.tsx";
import FeatureGate from "@/components/FeatureGate.tsx";
import HeaderScripts from "@/components/HeaderScripts.tsx";
import OnboardingChecklist from "@/components/OnboardingChecklist.tsx";
import AdminGuard from "@/components/AdminGuard.tsx";
import Index from "./pages/Index.tsx";

// Lazy-loaded route components for code-splitting / perf
const Explore = lazy(() => import("./pages/Explore.tsx"));
const Experiences = lazy(() => import("./pages/Experiences.tsx"));
const ExperienceDetail = lazy(() => import("./pages/ExperienceDetail.tsx"));
const HostProfile = lazy(() => import("./pages/HostProfile.tsx"));
const Booking = lazy(() => import("./pages/Booking.tsx"));
const BecomeHost = lazy(() => import("./pages/BecomeHost.tsx"));
const Signup = lazy(() => import("./pages/Signup.tsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.tsx"));
const Destinations = lazy(() => import("./pages/Destinations.tsx"));
const DestinationDetail = lazy(() => import("./pages/DestinationDetail.tsx"));
const Community = lazy(() => import("./pages/Community.tsx"));
const Resources = lazy(() => import("./pages/Resources.tsx"));
const ResourceGuide = lazy(() => import("./pages/ResourceGuide.tsx"));
const TravelerDashboard = lazy(() => import("./pages/dashboard/TravelerDashboard.tsx"));
const HostDashboard = lazy(() => import("./pages/dashboard/HostDashboard.tsx"));
const AdminDashboard = lazy(() => import("./pages/dashboard/AdminDashboard.tsx"));
const HelpCenter = lazy(() => import("./pages/HelpCenter.tsx"));
const Safety = lazy(() => import("./pages/Safety.tsx"));
const Terms = lazy(() => import("./pages/Terms.tsx"));
const Docs = lazy(() => import("./pages/Docs.tsx"));
const HostTrip = lazy(() => import("./pages/HostTrip.tsx"));
const Grievances = lazy(() => import("./pages/Grievances.tsx"));
const BikeToursDetail = lazy(() => import("./pages/BikeToursDetail.tsx"));
const Trips = lazy(() => import("./pages/Trips.tsx"));
const TripDetail = lazy(() => import("./pages/TripDetail.tsx"));
const TripLeaderProfile = lazy(() => import("./pages/TripLeaderProfile.tsx"));
const BetaWanderers = lazy(() => import("./pages/BetaWanderers.tsx"));
const BetaWandererApply = lazy(() => import("./pages/BetaWandererApply.tsx"));
const BetaWandererProfile = lazy(() => import("./pages/BetaWandererProfile.tsx"));
const Leaderboard = lazy(() => import("./pages/Leaderboard.tsx"));
const Rewards = lazy(() => import("./pages/Rewards.tsx"));
const BlogDetail = lazy(() => import("./pages/BlogDetail.tsx"));
const Membership = lazy(() => import("./pages/Membership.tsx"));
const AuthCallback = lazy(() => import("./pages/AuthCallback.tsx"));
const Referrals = lazy(() => import("./pages/Referrals.tsx"));
const HostEligibility = lazy(() => import("./pages/HostEligibility.tsx"));
const BetaWaitlist = lazy(() => import("./pages/BetaWaitlist.tsx"));
const BetaWaitlistConfirm = lazy(() => import("./pages/BetaWaitlistConfirm.tsx"));
const FeatureFlagsAdmin = lazy(() => import("./pages/admin/FeatureFlagsAdmin.tsx"));
const WaitlistAdmin = lazy(() => import("./pages/admin/WaitlistAdmin.tsx"));
const AuditLogAdmin = lazy(() => import("./pages/admin/AuditLogAdmin.tsx"));
const FeaturesHub = lazy(() => import("./pages/FeaturesHub.tsx"));
const Feed = lazy(() => import("./pages/Feed.tsx"));
const TravelerProfile = lazy(() => import("./pages/TravelerProfile.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CurrencyProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <HeaderScripts />
          <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/experiences" element={<Experiences />} />
            <Route path="/experience/:id" element={<ExperienceDetail />} />
            <Route path="/host/:id" element={<HostProfile />} />
            <Route path="/book/:id" element={<Booking />} />
            <Route path="/become-host" element={<BecomeHost />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/destination/:name" element={<DestinationDetail />} />
            <Route path="/community" element={<Community />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resource/:slug" element={<ResourceGuide />} />
            <Route path="/dashboard/traveler" element={<TravelerDashboard />} />
            <Route path="/dashboard/host" element={<HostDashboard />} />
            <Route path="/dashboard/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/safety" element={<Safety />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/host-trip" element={<HostTrip />} />
            <Route path="/grievances" element={<Grievances />} />
            <Route path="/bike-tours" element={<BikeToursDetail />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/trip/:id" element={<TripDetail />} />
            <Route path="/trip-leader/:id" element={<TripLeaderProfile />} />
            <Route path="/beta-wanderers" element={<BetaWanderers />} />
            <Route path="/beta-wanderer-apply" element={<BetaWandererApply />} />
            <Route path="/beta-wanderer/:id" element={<BetaWandererProfile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/host-eligibility" element={<HostEligibility />} />
            <Route path="/beta-waitlist" element={<BetaWaitlist />} />
            <Route path="/beta-waitlist/confirm" element={<BetaWaitlistConfirm />} />
            <Route path="/admin/feature-flags" element={<AdminGuard><FeatureFlagsAdmin /></AdminGuard>} />
            <Route path="/admin/waitlist" element={<AdminGuard><WaitlistAdmin /></AdminGuard>} />
            <Route path="/admin/audit-log" element={<AdminGuard><AuditLogAdmin /></AdminGuard>} />
            <Route path="/features" element={<FeaturesHub />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/traveler/:id" element={<TravelerProfile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          <MobileBottomNav />
          <FeatureGate flag="ai_concierge"><AIChatRecommender /></FeatureGate>
          <OnboardingChecklist />
        </BrowserRouter>
      </TooltipProvider>
      </CurrencyProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
