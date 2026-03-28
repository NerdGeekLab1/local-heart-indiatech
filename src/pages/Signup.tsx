import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Signup = () => {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    phone: "", nationality: "",
    travelStyle: [] as string[], interests: [] as string[], agreeTerms: false,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));
  const toggleArray = (field: "travelStyle" | "interests", val: string) => {
    setForm(prev => ({ ...prev, [field]: prev[field].includes(val) ? prev[field].filter(v => v !== val) : [...prev[field], val] }));
  };

  const travelStyles = ["Solo Traveler", "Couple", "Family", "Group", "Backpacker", "Luxury"];
  const interestOptions = ["Cultural", "Spiritual", "Adventure", "Food", "Wellness", "Medical Care", "Wedding", "Village", "Festival", "Photography", "Bike Tour"];

  const handleSignup = async () => {
    if (!form.firstName || !form.email || !form.password) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (!form.agreeTerms) {
      toast({ title: "Please agree to terms", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
          phone: form.phone,
          nationality: form.nationality,
          travel_styles: form.travelStyle,
          interests: form.interests,
        },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email! 📧", description: "We've sent you a verification link to confirm your account." });
    }
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      toast({ title: "Please enter email and password", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
    setLoading(false);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back! 🎉" });
      navigate("/dashboard/traveler");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <h1 className="text-3xl font-bold text-foreground">{mode === "signup" ? "Join Travelista" : "Welcome Back"}</h1>
          <p className="mt-1 text-muted-foreground">{mode === "signup" ? "Create your traveler account" : "Sign in to your account"}</p>

          {/* Mode Toggle */}
          <div className="mt-4 flex gap-1 bg-secondary rounded-lg p-1">
            <button onClick={() => setMode("signup")} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === "signup" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>Sign Up</button>
            <button onClick={() => setMode("login")} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>Log In</button>
          </div>

          {mode === "login" ? (
            <div className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Email *</label>
                <input type="email" value={form.email} onChange={e => update("email", e.target.value)} className="mt-1 w-full rounded-lg bg-card border border-border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="relative">
                <label className="text-xs font-medium text-muted-foreground">Password *</label>
                <input type={showPassword ? "text" : "password"} value={form.password} onChange={e => update("password", e.target.value)} className="mt-1 w-full rounded-lg bg-card border border-border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-muted-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button onClick={handleLogin} disabled={loading} className="w-full rounded-full bg-primary text-primary-foreground">
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </div>
          ) : (
            <>
              <div className="mt-6 flex gap-2">
                {[1, 2, 3].map(s => (
                  <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-border"}`} />
                ))}
              </div>

              {step === 1 && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold text-foreground">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">First Name *</label>
                      <input value={form.firstName} onChange={e => update("firstName", e.target.value)} className="mt-1 w-full rounded-lg bg-card border border-border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Last Name</label>
                      <input value={form.lastName} onChange={e => update("lastName", e.target.value)} className="mt-1 w-full rounded-lg bg-card border border-border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Email *</label>
                    <input type="email" value={form.email} onChange={e => update("email", e.target.value)} className="mt-1 w-full rounded-lg bg-card border border-border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div className="relative">
                    <label className="text-xs font-medium text-muted-foreground">Password *</label>
                    <input type={showPassword ? "text" : "password"} value={form.password} onChange={e => update("password", e.target.value)} className="mt-1 w-full rounded-lg bg-card border border-border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-muted-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Phone</label>
                    <input type="tel" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+91..." className="mt-1 w-full rounded-lg bg-card border border-border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <Button onClick={() => setStep(2)} className="w-full rounded-full bg-primary text-primary-foreground">Continue</Button>
                </div>
              )}

              {step === 2 && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold text-foreground">Travel Preferences</h3>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Nationality</label>
                    <input value={form.nationality} onChange={e => update("nationality", e.target.value)} placeholder="e.g., American, British" className="mt-1 w-full rounded-lg bg-card border border-border px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">How do you travel?</label>
                    <div className="flex flex-wrap gap-2">
                      {travelStyles.map(s => (
                        <button key={s} onClick={() => toggleArray("travelStyle", s)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${form.travelStyle.includes(s) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">What interests you?</label>
                    <div className="flex flex-wrap gap-2">
                      {interestOptions.map(i => (
                        <button key={i} onClick={() => toggleArray("interests", i)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${form.interests.includes(i) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>{i}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-full">Back</Button>
                    <Button onClick={() => setStep(3)} className="flex-1 rounded-full bg-primary text-primary-foreground">Continue</Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold text-foreground">Review & Confirm</h3>
                  <div className="rounded-lg bg-card border border-border p-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="text-foreground font-medium">{form.firstName} {form.lastName}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="text-foreground font-medium">{form.email}</span></div>
                    {form.phone && <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="text-foreground font-medium">{form.phone}</span></div>}
                    {form.nationality && <div className="flex justify-between"><span className="text-muted-foreground">Nationality</span><span className="text-foreground font-medium">{form.nationality}</span></div>}
                    {form.travelStyle.length > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Style</span><span className="text-foreground font-medium">{form.travelStyle.join(", ")}</span></div>}
                    {form.interests.length > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Interests</span><span className="text-foreground font-medium text-right max-w-[200px]">{form.interests.join(", ")}</span></div>}
                  </div>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.agreeTerms} onChange={e => update("agreeTerms", e.target.checked)} className="mt-1 accent-primary" />
                    <span className="text-xs text-muted-foreground">I agree to the <Link to="/terms" className="text-primary underline">Terms of Service</Link> and <Link to="/safety" className="text-primary underline">Safety Guidelines</Link></span>
                  </label>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1 rounded-full">Back</Button>
                    <Button onClick={handleSignup} disabled={loading} className="flex-1 rounded-full bg-primary text-primary-foreground">
                      {loading ? "Creating..." : "Create Account"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? (
              <>Already have an account? <button onClick={() => setMode("login")} className="text-primary font-medium hover:underline">Log in</button></>
            ) : (
              <>Don't have an account? <button onClick={() => setMode("signup")} className="text-primary font-medium hover:underline">Sign up</button></>
            )}
          </p>

          {/* Demo Accounts */}
          <div className="mt-6 rounded-xl bg-secondary/50 border border-border p-4">
            <p className="text-xs font-bold text-foreground mb-3 text-center">🔑 Quick Demo Login</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Traveler", emoji: "🧳", email: "demo.traveler@travelista.app", password: "demo123456" },
                { label: "Host", emoji: "🏠", email: "demo.host@travelista.app", password: "demo123456" },
                { label: "Admin", emoji: "👑", email: "demo.admin@travelista.app", password: "demo123456" },
              ].map(demo => (
                <button
                  key={demo.label}
                  onClick={async () => {
                    setLoading(true);
                    const { error } = await supabase.auth.signInWithPassword({ email: demo.email, password: demo.password });
                    setLoading(false);
                    if (error) {
                      toast({ title: `Demo ${demo.label} not set up yet`, description: "Please sign up first with this email", variant: "destructive" });
                    } else {
                      toast({ title: `Welcome, Demo ${demo.label}! 🎉` });
                      navigate(demo.label === "Admin" ? "/dashboard/admin" : demo.label === "Host" ? "/dashboard/host" : "/dashboard/traveler");
                    }
                  }}
                  disabled={loading}
                  className="flex flex-col items-center gap-1 rounded-lg bg-card border border-border p-3 hover:border-primary/30 hover:shadow-card transition-all text-center"
                >
                  <span className="text-xl">{demo.emoji}</span>
                  <span className="text-xs font-semibold text-foreground">{demo.label}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">Demo accounts for testing all features</p>
          </div>
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center bg-primary/5 p-12">
        <div className="max-w-sm text-center">
          <div className="text-6xl mb-6">🇮🇳</div>
          <h2 className="text-2xl font-bold text-foreground">Discover the Real India</h2>
          <p className="mt-3 text-muted-foreground">Join 10,000+ travelers who chose authentic connections over tourist traps.</p>
          <div className="mt-8 space-y-3">
            {["Connect with verified local hosts", "Book homestays, guides & transport", "Experiences you won't find anywhere else"].map(t => (
              <div key={t} className="flex items-center gap-2 text-sm text-foreground">
                <span className="w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs">✓</span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
