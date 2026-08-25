import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import MobileBottomNav from "@/components/MobileBottomNav.tsx";
const AIChatRecommender = lazy(() => import("@/components/AIChatRecommender.tsx"));
import HeaderScripts from "@/components/HeaderScripts.tsx";
import SiteHead from "@/components/SiteHead";
const OnboardingChecklist = lazy(() => import("@/components/OnboardingChecklist.tsx"));
import AdminGuard from "@/components/AdminGuard.tsx";
import RequireAuth from "@/components/RequireAuth.tsx";
import FormAvailabilityGate from "@/components/FormAvailabilityGate.tsx";
import FeatureGate from "@/components/FeatureGate.tsx";

import Breadcrumbs from "@/components/Breadcrumbs.tsx";
import { useLocation } from "react-router-dom";
import Index from "./pages/Index.tsx";

// Lazy-loaded route components for code-splitting / perf
const Explore = lazy(() => import("./pages/Explore.tsx"));
const Experiences = lazy(() => import("./pages/Experiences.tsx"));
const ExperienceTypes = lazy(() => import("./pages/ExperienceTypes.tsx"));
const CatalogExperience = lazy(() => import("./pages/CatalogExperience.tsx"));
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
const Privacy = lazy(() => import("./pages/Privacy.tsx"));
const Cookies = lazy(() => import("./pages/Cookies.tsx"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe.tsx"));
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
const PerformanceAdmin = lazy(() => import("./pages/admin/PerformanceAdmin.tsx"));
const FeaturesHub = lazy(() => import("./pages/FeaturesHub.tsx"));
const Feed = lazy(() => import("./pages/Feed.tsx"));
const TravelerProfile = lazy(() => import("./pages/TravelerProfile.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const PasswordRecovery = lazy(() => import("./pages/PasswordRecovery.tsx"));
const HostOnboarding = lazy(() => import("./pages/HostOnboarding.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
  </div>
);

const HIDE_CRUMBS = new Set(["/", "/signup", "/login/traveler", "/login/host", "/admin-login", "/auth/callback"]);
const BreadcrumbsBar = () => {
  const { pathname } = useLocation();
  if (HIDE_CRUMBS.has(pathname)) return null;
  return (
    <div className="pt-20 pb-2 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Breadcrumbs />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CurrencyProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SiteHead />
          <HeaderScripts />
          <BreadcrumbsBar />
          <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/experiences" element={<Experiences />} />
            <Route path="/experience/:id" element={<ExperienceDetail />} />
            <Route path="/experience-types" element={<ExperienceTypes />} />
            <Route path="/experience-type/:slug" element={<CatalogExperience />} />
            <Route path="/host/:id" element={<HostProfile />} />
            <Route path="/book/:id" element={<FormAvailabilityGate formKey="booking"><Booking /></FormAvailabilityGate>} />
            <Route path="/become-host" element={<FormAvailabilityGate formKey="become_host"><BecomeHost /></FormAvailabilityGate>} />
            <Route path="/signup" element={<FormAvailabilityGate formKey="account_signup"><Signup /></FormAvailabilityGate>} />
            <Route path="/login/traveler" element={<FormAvailabilityGate formKey="traveler_login"><Signup /></FormAvailabilityGate>} />
            <Route path="/login/host" element={<FormAvailabilityGate formKey="host_login"><Signup /></FormAvailabilityGate>} />
            <Route path="/admin-login" element={<FormAvailabilityGate formKey="admin_login"><AdminLogin /></FormAvailabilityGate>} />
            <Route path="/forgot-password" element={<FormAvailabilityGate formKey="password_recovery"><PasswordRecovery /></FormAvailabilityGate>} />
            <Route path="/reset-password" element={<PasswordRecovery />} />
            <Route path="/host-onboarding" element={<HostOnboarding />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/destination/:name" element={<DestinationDetail />} />
            <Route path="/community" element={<Community />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resource/:slug" element={<ResourceGuide />} />
            <Route path="/dashboard/traveler" element={<RequireAuth role="traveler"><TravelerDashboard /></RequireAuth>} />
            <Route path="/dashboard/host" element={<RequireAuth role="host"><HostDashboard /></RequireAuth>} />

            <Route path="/dashboard/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/safety" element={<Safety />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/host-trip" element={<FormAvailabilityGate formKey="host_trip"><HostTrip /></FormAvailabilityGate>} />
            <Route path="/grievances" element={<FormAvailabilityGate formKey="grievance"><Grievances /></FormAvailabilityGate>} />
            <Route path="/bike-tours" element={<BikeToursDetail />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/trip/:id" element={<TripDetail />} />
            <Route path="/trip-leader/:id" element={<TripLeaderProfile />} />
            <Route path="/beta-wanderers" element={<BetaWanderers />} />
            <Route path="/beta-wanderer-apply" element={<FormAvailabilityGate formKey="beta_wanderer"><BetaWandererApply /></FormAvailabilityGate>} />
            <Route path="/beta-wanderer/:id" element={<BetaWandererProfile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/host-eligibility" element={<FormAvailabilityGate formKey="host_eligibility_beta"><FeatureGate flag="host_eligibility_beta" fallback={<main className="min-h-screen bg-background flex items-center justify-center px-4"><section className="max-w-lg rounded-lg border border-border bg-card p-8 text-center shadow-card"><h1 className="text-2xl font-bold">Beta applications are closed</h1><p className="mt-2 text-muted-foreground">The Host Foreign Travelers beta is not accepting applications right now.</p></section></main>}><HostEligibility /></FeatureGate></FormAvailabilityGate>} />
            <Route path="/beta-waitlist" element={<FormAvailabilityGate formKey="beta_waitlist"><BetaWaitlist /></FormAvailabilityGate>} />
            <Route path="/beta-waitlist/confirm" element={<BetaWaitlistConfirm />} />
            <Route path="/admin/feature-flags" element={<AdminGuard><FeatureFlagsAdmin /></AdminGuard>} />
            <Route path="/admin/waitlist" element={<AdminGuard><WaitlistAdmin /></AdminGuard>} />
            <Route path="/admin/audit-log" element={<AdminGuard><AuditLogAdmin /></AdminGuard>} />
            <Route path="/admin/performance" element={<AdminGuard><PerformanceAdmin /></AdminGuard>} />
            <Route path="/features" element={<FeaturesHub />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/traveler/:id" element={<TravelerProfile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          <MobileBottomNav />
          <Suspense fallback={null}>
            <AIChatRecommender />
            <OnboardingChecklist />
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
      </CurrencyProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
