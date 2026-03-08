import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

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
      toast.success("Account created!");
      navigate("/feed");
    } catch (err: any) {
      toast.error(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-mesh px-4 relative">
      <Link to="/" className="absolute top-6 left-6 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm glass rounded-3xl p-8 space-y-6 noise"
      >
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block font-display font-bold text-lg gradient-text mb-2">SpaceHub</Link>
          <h1 className="text-2xl font-display font-bold text-foreground">Create your account</h1>
          <p className="text-muted-foreground text-sm">Join the community in seconds</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Username</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required className="bg-surface/60 border-border/40 rounded-xl h-11 focus:ring-1 focus:ring-primary/30" placeholder="cosmicuser" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-surface/60 border-border/40 rounded-xl h-11 focus:ring-1 focus:ring-primary/30" placeholder="you@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="bg-surface/60 border-border/40 rounded-xl h-11 focus:ring-1 focus:ring-primary/30" placeholder="••••••••" />
          </div>
          <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground font-bold rounded-xl h-11">
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
