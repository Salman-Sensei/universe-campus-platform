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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const { signIn, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/feed");
    } catch (error: unknown) {
      toast.error(getAuthErrorMessage(error, "Failed to sign in"));
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
          <h1 className="text-2xl font-display font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground text-sm">Sign in to continue to your feed</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 rounded-lg" placeholder="you@university.edu" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 rounded-lg" placeholder="Your password" />
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-lg h-11 font-semibold">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <Button
            type="button"
            variant="link"
            disabled={resettingPassword}
            onClick={async () => {
              if (!email.trim()) { toast.error("Enter your email first"); return; }
              setResettingPassword(true);
              try {
                await resetPassword(email);
                toast.success("Password reset email sent! Check your inbox.");
              } catch (error: unknown) {
                toast.error(getAuthErrorMessage(error, "Failed to send reset email"));
              } finally {
                setResettingPassword(false);
              }
            }}
            className="w-full h-auto p-0 text-xs text-muted-foreground hover:text-primary"
          >
            {resettingPassword ? "Sending..." : "Forgot your password?"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline underline-offset-4">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}