import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sections = [
  {
    title: "1. What We Collect",
    content: "We collect information you give us directly: your name, email, phone number, nationality, profile photo, travel styles and interests when you create an account; host KYC details when you apply to host; booking details, reviews, feed posts, and messages you create on the platform. We also collect usage data such as pages visited, device type, and approximate location when you browse Travelista."
  },
  {
    title: "2. How We Use Your Data",
    content: "Your data powers the marketplace: matching travelers with hosts, processing bookings and invoices, running the Traveler Feed, verifying host eligibility, computing travel streaks and stamps, and keeping the platform safe through moderation and grievance resolution. We do not sell your personal data to advertisers."
  },
  {
    title: "3. What Other Users Can See",
    content: "Your public profile shows your first name, avatar, bio, nationality, travel styles and social links you choose to add. Feed posts you publish are visible to the community. Your email, phone number, booking history, invoices, and private messages are never public. Hosts see traveler details only after a booking is confirmed."
  },
  {
    title: "4. Data Storage & Security",
    content: "Travelista is built on Lovable Cloud. Data is stored in a managed Postgres database with row-level security policies that restrict every table to its rightful owner, encrypted connections (TLS) for all traffic, and scoped storage buckets for avatars and feed media. Administrative actions are recorded in an audit log."
  },
  {
    title: "5. Third-Party Services",
    content: "We use a small set of subprocessors to run the platform: Lovable Cloud (hosting, database, authentication, file storage), Lovable AI Gateway (AI concierge recommendations), and Google (optional sign-in). Analytics and error monitoring may process pseudonymous usage data. Each provider processes data only to deliver its service to us."
  },
  {
    title: "6. Retention & Deletion",
    content: "Account data is kept while your account is active. You may request deletion of your account and personal data at any time from the Help Center or by emailing privacy@travelista.com. Booking and invoice records are retained for up to 7 years where required for tax and accounting compliance; feed posts and messages are removed when your account is deleted."
  },
  {
    title: "7. Your Rights",
    content: "You can access, correct, export, or delete your personal data. You can withdraw marketing consent at any time. Users in the EEA/UK have additional rights under GDPR, and Indian users under the DPDP Act 2023, including the right to grievance redressal through our Grievance Officer (grievances@travelista.com)."
  },
  {
    title: "8. Children",
    content: "Travelista is not directed at children under 18. We do not knowingly collect data from minors; accounts found to belong to minors are removed."
  },
  {
    title: "9. Changes to This Policy",
    content: "We will post any changes on this page and update the date above. Material changes will be announced in-app or by email at least 14 days before they take effect."
  },
  {
    title: "10. Contact",
    content: "Privacy questions or requests: privacy@travelista.com · Travelista Privacy Team, 123 Startup Lane, Bangalore, Karnataka 560001, India."
  },
];

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Privacy Policy | Travelista</title>
      <meta name="description" content="How Travelista collects, uses, stores, and protects your personal data — and the rights you have over it." />
    </Helmet>
    <Navbar />
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Privacy Policy</h1>
        <p className="mt-2 text-muted-foreground">Last updated: July 28, 2026</p>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          This policy is maintained by the Travelista team to explain what data we collect, why we collect it,
          and the control you have over it. It applies to travelers, hosts, and beta wanderers using Travelista.
        </p>
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

export default Privacy;
