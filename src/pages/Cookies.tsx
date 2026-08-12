import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sections = [
  {
    title: "1. What Are Cookies & Local Storage",
    content: "Cookies are small text files stored by your browser. RoamYoo also uses browser local storage, which works similarly but stays on your device. Together they keep you signed in, remember your preferences, and help the app load faster."
  },
  {
    title: "2. Strictly Necessary (Always On)",
    content: "Authentication session tokens (so you stay signed in between visits), security tokens that protect forms from abuse, and routing state. The platform cannot function without these."
  },
  {
    title: "3. Preferences",
    content: "We remember your choices so RoamYoo feels like yours: light/dark theme, currency (INR/USD/EUR), the last dashboard tab you opened (admin), dismissed onboarding checklists, and your last visited dashboard. These live in local storage on your device and are never sent to third parties."
  },
  {
    title: "4. Analytics & Performance",
    content: "We may use privacy-respecting analytics to understand which pages are popular and how the app performs (load times, errors). This data is aggregated and pseudonymous — it is not used to build advertising profiles, and we do not run third-party ad trackers."
  },
  {
    title: "5. Third-Party Cookies",
    content: "If you sign in with Google, Google may set its own cookies during the OAuth flow, governed by Google's privacy policy. Embedded content (for example, externally hosted videos) may set cookies from that provider when you play it."
  },
  {
    title: "6. Managing Cookies",
    content: "You can clear or block cookies in your browser settings at any time. Blocking strictly-necessary cookies will sign you out and may prevent login. Clearing local storage resets your theme, currency, and layout preferences but does not delete your account data."
  },
  {
    title: "7. Changes & Contact",
    content: "We will update this page if our cookie usage changes. Questions: privacy@travelista.com · RoamYoo, 123 Startup Lane, Bangalore, Karnataka 560001, India."
  },
];

const cookieRows = [
  { name: "sb-*-auth-token", purpose: "Sign-in session (Lovable Cloud auth)", type: "Strictly necessary", duration: "Session / refresh" },
  { name: "travelista-theme", purpose: "Light / dark mode preference", type: "Preference", duration: "Until cleared" },
  { name: "travelista-currency", purpose: "Display currency (₹ / $ / €)", type: "Preference", duration: "Until cleared" },
  { name: "travelista.admin.activeTab", purpose: "Last opened admin console tab", type: "Preference", duration: "Until cleared" },
  { name: "travelista.lastDashboard", purpose: "Last visited dashboard for quick return", type: "Preference", duration: "Until cleared" },
];

const Cookies = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Cookie Policy | RoamYoo</title>
      <meta name="description" content="Which cookies and local storage RoamYoo uses, why, and how to control them." />
    </Helmet>
    <Navbar />
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Cookie Policy</h1>
        <p className="mt-2 text-muted-foreground">Last updated: July 28, 2026</p>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          This page explains the cookies and browser storage RoamYoo uses. We keep it minimal:
          no advertising trackers, no cross-site profiling.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-8 rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-semibold px-4 py-3">Storage key / cookie</th>
                <th className="text-left font-semibold px-4 py-3">Purpose</th>
                <th className="text-left font-semibold px-4 py-3">Type</th>
                <th className="text-left font-semibold px-4 py-3">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cookieRows.map(c => (
                <tr key={c.name}>
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.purpose}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.type}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="mt-10 space-y-8">
        {sections.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-lg font-bold text-foreground">{s.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.content}</p>
          </motion.div>
        ))}
      </div>
    </div>
    <Footer />
  </div>
);

export default Cookies;
