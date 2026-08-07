import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data.session) {
          setStatus("success");
          setMessage("Email verified! Redirecting...");
          setTimeout(() => navigate("/dashboard/traveler"), 1500);
        } else {
          setStatus("success");
          setMessage("Email verified! Please sign in.");
          setTimeout(() => navigate("/signup"), 2000);
        }
      } catch {
        setStatus("error");
        setMessage("Verification failed. Please try again.");
        setTimeout(() => navigate("/signup"), 3000);
      }
    };
    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8">
        <div className="text-6xl mb-4">
          {status === "loading" ? "⏳" : status === "success" ? "✅" : "❌"}
        </div>
        <h1 className="text-2xl font-bold text-foreground">{message}</h1>
        {status === "loading" && (
          <div className="mt-4 w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        )}
      </motion.div>
    </div>
  );
};

export default AuthCallback;
