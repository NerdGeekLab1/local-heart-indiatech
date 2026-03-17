import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Clock, MapPin, Users, Play, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { experiences, hosts, reviews } from "@/lib/data";

const ExperienceDetail = () => {
  const { id } = useParams();
  const exp = experiences.find(e => e.id === id);

  if (!exp) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Experience not found</h1>
          <Link to="/experiences" className="text-primary mt-2 inline-block hover:underline">Back to Experiences</Link>
        </div>
      </div>
    );
  }

  const host = hosts.find(h => h.id === exp.hostId);
  const hostReviews = reviews.filter(r => r.hostId === exp.hostId).slice(0, 3);

  const timeline = [
    { time: "Start", title: "Meet your host", desc: `${exp.hostName} picks you up or meets you at the starting point` },
    { time: "Morning", title: "Immersive experience begins", desc: exp.description },
    { time: "Midday", title: "Local meal included", desc: "Enjoy authentic local cuisine prepared by or recommended by your host" },
    { time: "Afternoon", title: "Deeper exploration", desc: "Visit hidden gems and interact with locals for a truly authentic experience" },
    { time: "End", title: "Farewell & memories", desc: "Exchange contacts, get local tips, and take home unforgettable memories" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        {/* Hero Image */}
        <div className="relative h-[50vh] min-h-[350px] overflow-hidden">
          <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-foreground/20" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 mx-auto max-w-5xl">
            <Link to="/experiences" className="inline-flex items-center gap-1 text-sm text-primary-foreground/80 hover:text-primary-foreground mb-3">
              <ArrowLeft className="w-4 h-4" /> Experiences
            </Link>
            <span className="inline-block text-xs uppercase tracking-wider font-bold text-primary-foreground bg-primary/80 px-2 py-0.5 rounded-sm mb-2">
              {exp.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-primary-foreground">{exp.title}</h1>
            <div className="flex items-center gap-4 mt-3 text-sm text-primary-foreground/90">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {exp.hostCity}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {exp.duration}</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-primary text-primary" /> {exp.rating} ({exp.reviewCount} reviews)</span>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">About This Experience</h2>
                <p className="text-muted-foreground leading-relaxed">{exp.description}</p>
              </div>

              {/* Highlights */}
              {exp.highlights && (
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-3">Highlights</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {exp.highlights.map(h => (
                      <div key={h} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                        {h}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Experience Timeline</h2>
                <div className="space-y-0">
                  {timeline.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                      className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${i === 0 ? "bg-primary" : "bg-border"} shrink-0 mt-1.5`} />
                        {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-border" />}
                      </div>
                      <div className="pb-6">
                        <p className="text-xs font-bold uppercase tracking-wider text-primary">{item.time}</p>
                        <h3 className="text-sm font-semibold text-foreground mt-0.5">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Video Section */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">📹 Past Experience Videos</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2].map(i => (
                    <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-secondary group cursor-pointer">
                      <img src={exp.image} alt="video" className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-primary/80 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 text-xs font-medium text-primary-foreground bg-foreground/40 backdrop-blur-sm px-2 py-0.5 rounded">
                        {exp.title} • Clip {i}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">What Travelers Say</h2>
                <div className="space-y-3">
                  {hostReviews.map(r => (
                    <div key={r.id} className="rounded-lg bg-card p-4 shadow-card">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">{r.travelerName[0]}</div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{r.travelerName} <span className="text-muted-foreground font-normal">· {r.country}</span></p>
                          <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-3 h-3 fill-primary text-primary" />)}</div>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <div className="rounded-lg bg-card p-5 shadow-card">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">${exp.price}</span>
                    <span className="text-sm text-muted-foreground">/ person</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{exp.duration}</p>
                  <Link to={host ? `/book/${host.id}` : "/explore"}>
                    <Button className="w-full mt-4 rounded-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                      Book This Experience
                    </Button>
                  </Link>
                </div>

                {host && (
                  <Link to={`/host/${host.id}`} className="block rounded-lg bg-card p-4 shadow-card hover:shadow-card-hover transition-shadow">
                    <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">Your Host</p>
                    <div className="flex items-center gap-3">
                      <img src={host.image} alt={host.name} className="w-12 h-12 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold text-foreground">{host.name}</p>
                        <p className="text-sm text-muted-foreground">{host.city} · {host.rating} ★</p>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ExperienceDetail;
