import { motion } from "framer-motion";
import { MessageCircle, Heart, Users, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { communityStories, hosts, reviews } from "@/lib/data";

const Community = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Community</h1>
        <p className="mt-2 text-muted-foreground">Stories, connections, and inspiration from the Travelista family</p>
      </motion.div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Travelers Connected", value: "10,000+", icon: Users },
          { label: "Stories Shared", value: "2,500+", icon: BookOpen },
          { label: "Reviews Written", value: "5,000+", icon: MessageCircle },
          { label: "Hosts Active", value: `${hosts.length * 15}+`, icon: Heart },
        ].map(s => (
          <div key={s.label} className="rounded-lg bg-card p-4 shadow-card text-center">
            <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Traveler Stories */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-foreground mb-6">Traveler Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {communityStories.map((story, i) => (
            <motion.div key={story.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="rounded-lg bg-card p-6 shadow-card hover:shadow-card-hover transition-shadow">
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{story.city}</span>
              <h3 className="mt-3 font-bold text-foreground">{story.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{story.excerpt}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{story.travelerName}</span>
                <span>·</span>
                <span>{story.country}</span>
                <span>·</span>
                <span>with {story.hostName}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Host Spotlights */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-foreground mb-6">Host Spotlights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {hosts.slice(0, 4).map(h => (
            <div key={h.id} className="rounded-lg bg-card p-4 shadow-card text-center">
              <img src={h.image} alt={h.name} className="w-16 h-16 rounded-full mx-auto object-cover mb-3" />
              <p className="font-bold text-foreground">{h.name}</p>
              <p className="text-xs text-muted-foreground">{h.city} · {h.reviewCount} reviews</p>
              <p className="mt-2 text-xs text-muted-foreground italic">"{h.tagline}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-foreground mb-6">Latest Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.slice(0, 6).map(r => {
            const host = hosts.find(h => h.id === r.hostId);
            return (
              <div key={r.id} className="rounded-lg bg-card p-4 shadow-card">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">{r.travelerName[0]}</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.travelerName} · {r.country}</p>
                    <p className="text-xs text-muted-foreground">about {host?.name}, {host?.city}</p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Travel Tips */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-foreground mb-6">Travel Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Best Time to Visit India", tip: "October to March offers the most comfortable weather across most of India. Monsoon season (July-Sept) is magical in Kerala and Goa." },
            { title: "Respecting Local Customs", tip: "Remove shoes before entering homes and temples. Dress modestly at religious sites. Always ask before photographing people." },
            { title: "Staying Safe", tip: "Book through Travelista for verified hosts. Share your itinerary with family. Keep digital copies of documents. Stay hydrated." },
          ].map(t => (
            <div key={t.title} className="rounded-lg bg-secondary p-5">
              <h3 className="font-semibold text-foreground text-sm">{t.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default Community;
