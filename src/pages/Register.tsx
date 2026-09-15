import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { getAuthErrorMessage } from "@/lib/auth-errors";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length < 3) return toast.error("Username must be at least 3 characters");
    setLoading(true);
    try {
      await signUp(email, password, username);
      toast.success("Account created! Please check your email to verify.");
      navigate("/login");
    } catch (error: unknown) {
      toast.error(getAuthErrorMessage(error, "Failed to sign up"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell min-h-screen flex items-center justify-center px-4 relative">
      <Link to="/" className="absolute top-6 left-6 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 space-y-6"
      >
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex justify-center mb-2">
            <BrandMark />
          </Link>
          <h1 className="text-2xl font-display font-bold text-foreground">Join UniVerse</h1>
          <p className="text-muted-foreground text-sm">Create your academic profile</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs font-medium text-muted-foreground">Username</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required className="h-11 rounded-lg" placeholder="johndoe" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">University Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 rounded-lg" placeholder="you@university.edu" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="h-11 rounded-lg" placeholder="At least 6 characters" />
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-lg h-11 font-semibold">
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline underline-offset-4">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}