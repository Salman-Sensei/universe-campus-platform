import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket, Users, Sparkles, Zap, Globe, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass-strong">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-display font-bold gradient-text"
          >
            SpaceHub
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="gradient-primary text-primary-foreground font-semibold rounded-full px-5">
                Get Started
              </Button>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background layers */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 scale-110"
            style={{ backgroundImage: `url(${heroBg})` }}
          />
          <div className="absolute inset-0 gradient-mesh" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        </div>

        {/* Floating orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [-20, 20, -20] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-[15%] w-72 h-72 rounded-full bg-primary/5 blur-3xl"
          />
          <motion.div
            animate={{ y: [15, -25, 15] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/3 right-[10%] w-96 h-96 rounded-full bg-accent/5 blur-3xl"
          />
          <motion.div
            animate={{ y: [10, -15, 10] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 left-1/2 w-64 h-64 rounded-full bg-primary/3 blur-3xl"
          />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8"
          >
            <span className="h-2 w-2 rounded-full gradient-primary animate-pulse-glow" />
            <span className="text-sm text-muted-foreground font-medium">Now in public beta</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl md:text-8xl font-display font-extrabold mb-6 leading-[0.95] tracking-tighter text-balance"
          >
            Your Space.{" "}
            <br className="hidden sm:block" />
            <span className="gradient-text">Your Rules.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
            className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed text-balance"
          >
            The social platform where you own your identity. Build a profile that's unmistakably you, powered by AI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/register">
              <Button size="lg" className="gradient-primary text-primary-foreground font-bold text-base px-8 h-13 rounded-full glow-border group">
                <Rocket className="mr-2 h-5 w-5 group-hover:animate-float" />
                Launch Your Profile
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-border/60 text-foreground h-13 rounded-full px-8 hover:bg-surface-hover">
                I have an account
              </Button>
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-20 flex justify-center gap-12 text-center"
          >
            {[
              { value: "10K+", label: "Users" },
              { value: "50K+", label: "Posts" },
              { value: "99%", label: "Uptime" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl md:text-3xl font-display font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">
              Features
            </motion.p>
            <motion.h3 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-display font-bold text-foreground text-balance">
              Everything you need to{" "}
              <span className="gradient-text">stand out</span>
            </motion.h3>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-5"
          >
            {[
              {
                icon: Users, title: "Rich Profiles",
                desc: "Bio, music taste, quotes, interests — express yourself fully. No generic boxes.",
                gradient: "from-primary/20 to-primary/5",
              },
              {
                icon: Sparkles, title: "AI Writing Assistant",
                desc: "Get personalized post suggestions and polish your writing with AI that knows your style.",
                gradient: "from-accent/20 to-accent/5",
              },
              {
                icon: Globe, title: "Global Feed",
                desc: "Discover fresh voices from the community. Real posts from real people, no algorithm games.",
                gradient: "from-primary/15 to-accent/10",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass rounded-2xl p-7 space-y-4 group cursor-default relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center mb-1 group-hover:glow-border transition-shadow duration-300">
                    <f.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h4 className="font-display font-semibold text-lg text-foreground">{f.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="glass rounded-3xl p-12 md:p-16 relative overflow-hidden noise"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="relative z-10">
              <Zap className="h-10 w-10 text-primary mx-auto mb-5 animate-pulse-glow" />
              <h3 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 text-balance">
                Ready to claim your space?
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Join thousands of people building their digital identity on SpaceHub.
              </p>
              <Link to="/register">
                <Button size="lg" className="gradient-primary text-primary-foreground font-bold rounded-full px-10 h-13 glow-border">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-display font-bold text-lg gradient-text">SpaceHub</span>
          <p className="text-muted-foreground text-sm">© 2026 SpaceHub. Built for dreamers.</p>
        </div>
      </footer>
    </div>
  );
}
