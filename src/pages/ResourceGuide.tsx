import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Lightbulb, BookOpen, Camera, Users, DollarSign, FileText, TrendingUp, Video, Star, MessageCircle, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const guides: Record<string, { icon: React.ElementType; title: string; subtitle: string; sections: { heading: string; content: string; tips?: string[] }[] }> = {
  handbook: {
    icon: BookOpen, title: "Host Handbook", subtitle: "Complete guide from setup to earning 5-star reviews",
    sections: [
      { heading: "Creating Your Profile", content: "Your profile is the first impression travelers get. Use a warm, genuine photo and write a bio that highlights your personality and local expertise. Mention specific neighborhoods you know, hidden spots you love, and what makes your city special to you.", tips: ["Use a clear, smiling headshot", "Mention years of local experience", "List languages you speak fluently", "Add your specialties and interests"] },
      { heading: "Setting Up Your Space", content: "If you offer accommodation, ensure your space is clean, well-lit, and has all essentials. Take photos during golden hour for the best look. Highlight unique features like a rooftop terrace, courtyard, or heritage architecture.", tips: ["Invest in quality bedding", "Provide basic toiletries", "Add local touches — artwork, books about the area", "Ensure reliable WiFi and hot water"] },
      { heading: "Writing Compelling Descriptions", content: "Avoid generic phrases. Instead of 'nice room,' say 'sun-drenched corner room with hand-painted Rajasthani frescoes and a view of the old city walls.' Paint a picture that makes travelers feel they're already there.", tips: ["Use sensory language", "Be specific about distances to landmarks", "Mention what's walkable", "Describe the neighborhood vibe"] },
      { heading: "Pricing Strategy", content: "Research comparable listings in your area. Start slightly below market rate to build reviews, then gradually increase. Consider seasonal pricing — charge more during festivals and peak tourist season.", tips: ["Offer weekly/monthly discounts", "Adjust for festivals and events", "Bundle services for better value", "Be transparent about all costs"] },
      { heading: "Guest Communication", content: "Respond to inquiries within 1 hour. Send a pre-arrival message 2 days before with directions, local weather, and packing tips. During the stay, check in once without being intrusive. After checkout, thank them and request a review.", tips: ["Create message templates", "Share a digital guidebook", "Be available but not overbearing", "Follow up within 24 hours of checkout"] },
    ]
  },
  photo: {
    icon: Camera, title: "Photography Guide", subtitle: "Professional tips for capturing your property and experiences",
    sections: [
      { heading: "Lighting Techniques", content: "Natural light is your best friend. Shoot rooms during the golden hour (early morning or late afternoon). Open all curtains and turn on warm lights for a cozy feel. Avoid harsh midday sun that creates unflattering shadows.", tips: ["Shoot from corner to corner for spacious feel", "Use HDR mode on your phone", "Clean all surfaces before shooting", "Remove personal clutter"] },
      { heading: "Smartphone Photography", content: "Modern smartphones take stunning photos. Use the wide-angle lens for rooms, portrait mode for food shots, and the standard lens for experience photos. Always clean your lens before shooting.", tips: ["Use grid lines for straight horizons", "Tap to focus on the subject", "Take 10+ shots of each angle", "Edit with free apps like Snapseed"] },
      { heading: "Action Shots for Experiences", content: "Capture the emotion, not just the activity. Photograph travelers laughing, learning, tasting. Candid shots outperform posed ones. Get permission first and share photos after the experience.", tips: ["Capture from multiple angles", "Include local context in the frame", "Photograph food before it's served", "Use burst mode for action"] },
    ]
  },
  "guest-comm": {
    icon: Users, title: "Guest Communication", subtitle: "Templates and tips for managing guest relationships",
    sections: [
      { heading: "Response Templates", content: "Create templates for common scenarios: initial inquiry, booking confirmation, pre-arrival instructions, check-in welcome, mid-stay check-in, checkout thanks, and review request. Personalize each one with the guest's name and trip details." },
      { heading: "Handling Difficult Situations", content: "Stay calm and empathetic. Acknowledge the issue, apologize sincerely, and offer a concrete solution. Document everything. If you can't resolve it, escalate through the platform's support system." },
      { heading: "Building Long-Term Relationships", content: "Send seasonal greetings to past guests. Share updates about new experiences or property improvements. Many hosts report 30%+ of bookings from returning guests or referrals." },
    ]
  },
  pricing: {
    icon: DollarSign, title: "Pricing Strategy", subtitle: "Dynamic pricing and revenue optimization",
    sections: [
      { heading: "Market Research", content: "Study 10-15 comparable listings weekly. Note their pricing, occupancy, and review scores. Use this data to position yourself competitively. Track local events that drive demand." },
      { heading: "Seasonal Calendar", content: "Create a 12-month pricing calendar. Peak months (Oct-Mar for most Indian destinations) warrant 20-40% premium. Monsoon discounts of 15-25% can maintain occupancy during off-season." },
      { heading: "Bundle Pricing", content: "Offer packages: 'Complete Rajasthan Experience' (Stay + Guide + Food) at 15% discount vs individual services. Bundles increase average booking value by 40%." },
    ]
  },
  tax: {
    icon: FileText, title: "Tax & Legal Guide", subtitle: "GST compliance and legal requirements for hosting in India",
    sections: [
      { heading: "GST Registration", content: "If your annual hosting income exceeds ₹20 lakhs (₹10 lakhs for special category states), GST registration is mandatory. The applicable rate is 12% for rooms priced ₹1,000-₹7,500/night and 18% above ₹7,500." },
      { heading: "Income Tax Filing", content: "Hosting income is taxable under 'Income from Business/Profession' or 'Income from House Property' depending on structure. Maintain proper books of accounts and file ITR-3 or ITR-4." },
      { heading: "Insurance & Liability", content: "Get comprehensive property insurance covering guest injuries, property damage, and theft. The platform provides basic coverage, but additional insurance is recommended for high-value properties." },
    ]
  },
  growth: {
    icon: TrendingUp, title: "Growth Playbook", subtitle: "Scale from 1 listing to multiple properties",
    sections: [
      { heading: "Multi-Property Management", content: "Once you have 3+ properties, invest in a property management system. Automate guest communications, cleaning schedules, and financial tracking. Hire a local caretaker for each property." },
      { heading: "Team Building", content: "Hire guides, drivers, and cooks who share your passion for hospitality. Train them on your quality standards. Pay fairly and offer performance bonuses based on guest reviews." },
      { heading: "Revenue Optimization", content: "Diversify income streams: experiences, food tours, airport transfers, travel planning. Top hosts earn 40% of revenue from add-on services beyond accommodation." },
    ]
  },
  video: {
    icon: Video, title: "Video Content Guide", subtitle: "Create engaging videos for listings and social media",
    sections: [
      { heading: "Equipment", content: "You don't need expensive gear. A smartphone with good stabilization, a ₹500 tripod, and natural lighting are enough. Use a lapel mic (₹300) for better audio in experience videos." },
      { heading: "Storytelling Techniques", content: "Every video needs a hook (first 3 seconds), story (middle), and call-to-action (end). Show the transformation — the boring street that leads to the magical hidden temple. Create anticipation." },
      { heading: "Platform-Specific Formats", content: "Instagram Reels: 15-30 seconds, vertical, trending audio. YouTube: 5-10 minutes, horizontal, detailed. Platform listing: 60-90 seconds, highlight reel format." },
    ]
  },
  reviews: {
    icon: Star, title: "Review Strategy", subtitle: "Earn consistently high ratings",
    sections: [
      { heading: "Earning 5-Star Reviews", content: "Exceed expectations at every touchpoint. A small welcome gift, a handwritten note, or a surprise local treat creates memorable moments that inspire great reviews." },
      { heading: "Responding to Criticism", content: "Thank the reviewer, acknowledge the issue, explain what you've done to fix it. Never be defensive. Future guests read your responses more than the review itself." },
      { heading: "Leveraging Testimonials", content: "Ask happy guests for video testimonials. Feature them on your profile. Share on social media with permission. Video reviews are 3x more influential than text." },
    ]
  },
  social: {
    icon: MessageCircle, title: "Social Media for Hosts", subtitle: "Build your brand on Instagram and YouTube",
    sections: [
      { heading: "Content Calendar", content: "Post 4-5 times per week. Mix: property tours (Mon), local tips (Tue), guest stories (Wed), behind-the-scenes (Thu), weekend getaway inspiration (Fri). Use scheduling tools." },
      { heading: "Hashtag Strategy", content: "Use 20-25 hashtags mixing popular (#IncredibleIndia) and niche (#JaipurHomestay). Create a branded hashtag for your property. Engage with location-specific hashtags." },
      { heading: "Influencer Collaborations", content: "Invite travel micro-influencers (5K-50K followers) for complimentary stays in exchange for content. Their authentic posts drive 5-10x more bookings than paid ads." },
    ]
  },
  safety: {
    icon: Shield, title: "Safety Protocols", subtitle: "Emergency procedures and guest safety",
    sections: [
      { heading: "Emergency Contacts", content: "Display emergency numbers prominently: Police (100), Ambulance (108), Fire (101), local hospital, nearest police station. Share with guests on arrival." },
      { heading: "Fire Safety", content: "Install smoke detectors in every room. Keep fire extinguishers accessible. Create and display evacuation routes. Conduct quarterly safety drills with your team." },
      { heading: "Guest Verification", content: "Collect government ID at check-in as required by law. Verify booking details. Trust your instincts — if something feels off, contact platform support." },
    ]
  },
  culture: {
    icon: Globe, title: "Cultural Sensitivity Guide", subtitle: "Welcoming guests from all backgrounds",
    sections: [
      { heading: "Cultural Dos and Don'ts", content: "Learn basic greetings in common languages. Respect dietary preferences without judgment. Be aware of religious sensitivities — temple dress codes, prayer times, festival customs." },
      { heading: "Dietary Considerations", content: "Ask about dietary restrictions before arrival. Stock alternatives: plant-based milk, gluten-free options, halal/kosher options where possible. Label all dishes clearly." },
      { heading: "Inclusive Hosting", content: "Welcome all guests regardless of nationality, gender, orientation, or ability. Make reasonable accessibility accommodations. Use inclusive language in all communications." },
    ]
  },
};

const ResourceGuide = () => {
  const { slug } = useParams();
  const guide = guides[slug || ""];

  if (!guide) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center">
          <p className="text-muted-foreground">Guide not found</p>
          <Link to="/resources" className="text-primary hover:underline text-sm mt-2 inline-block">Back to Resources</Link>
        </div>
      </div>
    );
  }

  const Icon = guide.icon;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
        <Link to="/resources" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Resources
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Icon className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{guide.title}</h1>
              <p className="text-muted-foreground">{guide.subtitle}</p>
            </div>
          </div>

          <div className="space-y-8">
            {guide.sections.map((section, i) => (
              <motion.div key={section.heading} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.05 }} className="rounded-2xl bg-card shadow-card p-6">
                <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</span>
                  {section.heading}
                </h2>
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                {section.tips && section.tips.length > 0 && (
                  <div className="mt-4 rounded-xl bg-primary/5 border border-primary/10 p-4">
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-primary" /> Pro Tips
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {section.tips.map(tip => (
                        <div key={tip} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                          <CheckCircle className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" /> {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-6 text-center">
            <h3 className="text-lg font-bold text-foreground">Need More Help?</h3>
            <p className="text-sm text-muted-foreground mt-1">Join the host community or check other guides.</p>
            <div className="flex gap-3 justify-center mt-4">
              <Link to="/community"><Button variant="outline" className="rounded-full">Community</Button></Link>
              <Link to="/resources"><Button className="rounded-full">All Guides</Button></Link>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default ResourceGuide;
