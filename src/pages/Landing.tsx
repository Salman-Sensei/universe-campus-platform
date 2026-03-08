import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket, Users, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />

        <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
          <h1 className="text-2xl font-display font-bold gradient-text">SpaceHub</h1>
          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-foreground hover:text-primary">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button className="gradient-primary text-primary-foreground font-semibold">Join Now</Button>
            </Link>
          </div>
        </nav>

        <div className="relative z-10 text-center px-6 py-32 max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-7xl font-display font-bold mb-6 glow-text text-foreground"
          >
            Your Space.{" "}
            <span className="gradient-text">Your Rules.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto"
          >
            A social platform where you own your identity. Customize your profile, share your thoughts, and connect with people who get you.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link to="/register">
              <Button size="lg" className="gradient-primary text-primary-foreground font-semibold text-lg px-8 py-6 rounded-xl glow-border">
                <Rocket className="mr-2 h-5 w-5" /> Launch Your Profile
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-8">
        {[
          { icon: Users, title: "Customizable Profiles", desc: "Add your bio, music, quotes, and interests. Make your profile truly yours." },
          { icon: Sparkles, title: "AI-Powered Writing", desc: "Get smart suggestions for posts based on your interests and style." },
          { icon: Rocket, title: "Global Feed", desc: "Discover new people and ideas from the community in real time." },
        ].map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            viewport={{ once: true }}
            className="glass rounded-xl p-6 text-center space-y-3"
          >
            <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mx-auto">
              <f.icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg text-foreground">{f.title}</h3>
            <p className="text-muted-foreground text-sm">{f.desc}</p>
          </motion.div>
        ))}
      </section>

      <footer className="text-center py-10 text-muted-foreground text-sm border-t border-border/30">
        © 2026 SpaceHub. Built for dreamers.
      </footer>
    </div>
  );
}
