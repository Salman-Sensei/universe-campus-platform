import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Users,
  Sparkles,
  BookOpen,
  ArrowRight,
  Shield,
  MessageSquare,
  Ghost,
  Tag,
  Bot,
  FileText,
  UserPlus,
  Compass,
  Rocket,
  Star,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass-strong border-b border-border/30">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3.5">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-display font-bold gradient-text tracking-tight">UniVerse</h1>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#community" className="hover:text-foreground transition-colors">Community</a>
          </div>
          <div className="flex items-center gap-2">
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
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-24">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [-20, 20, -20] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-[12%] w-80 h-80 rounded-full bg-primary/10 blur-3xl"
          />
          <motion.div
            animate={{ y: [15, -25, 15] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/3 right-[8%] w-96 h-96 rounded-full bg-accent/10 blur-3xl"
          />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8"
          >
            <span className="h-2 w-2 rounded-full gradient-primary animate-pulse-glow" />
            <span className="text-sm text-muted-foreground font-medium">Built for BUKC students & faculty</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold mb-6 leading-[0.95] tracking-tighter text-balance"
          >
            Your campus.{" "}
            <br className="hidden sm:block" />
            <span className="gradient-text">Reimagined.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed text-balance"
          >
            One place to share, study, swap notes, find partners, post confessions, and grow together — all built for university life.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link to="/register">
              <Button size="lg" className="gradient-primary text-primary-foreground font-bold text-base px-8 h-12 rounded-full glow-border group w-full sm:w-auto">
                <Rocket className="mr-2 h-4 w-4 group-hover:animate-float" />
                Join UniVerse — Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <a href="#how">
              <Button size="lg" variant="outline" className="border-border/60 text-foreground h-12 rounded-full px-8 hover:bg-surface-hover w-full sm:w-auto">
                See how it works
              </Button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
          >
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> No credit card</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Verified faculty</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> AI moderated</span>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <section id="community" className="relative py-12 border-y border-border/30 glass">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "10K+", label: "Active students" },
            { value: "500+", label: "Verified faculty" },
            { value: "50K+", label: "Posts shared" },
            { value: "24/7", label: "Campus pulse" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl md:text-4xl font-display font-bold gradient-text">{s.value}</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bento Features */}
      <section id="features" className="relative py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-14 max-w-2xl mx-auto"
          >
            <motion.p variants={fadeUp} custom={0} className="text-primary font-semibold text-xs uppercase tracking-widest mb-3">
              Everything you need
            </motion.p>
            <motion.h3 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-display font-bold text-foreground text-balance">
              One platform.{" "}
              <span className="gradient-text">Every campus moment.</span>
            </motion.h3>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground mt-4">
              A modular suite of tools made for how students actually live, study, and connect.
            </motion.p>
          </motion.div>

          {/* Bento Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-6 auto-rows-[180px] gap-4"
          >
            {/* Large feature */}
            <motion.div
              variants={fadeUp}
              custom={0}
              whileHover={{ y: -3 }}
              className="md:col-span-4 md:row-span-2 glass rounded-3xl p-8 relative overflow-hidden group cursor-default"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/10 opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center mb-5">
                    <Sparkles className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h4 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-3 tracking-tight">
                    AI-powered academic feed
                  </h4>
                  <p className="text-muted-foreground text-sm md:text-base max-w-md leading-relaxed">
                    Smart ranking surfaces what matters from your followed peers, faculty, and subjects — never noise.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-primary text-sm font-semibold">
                  Personalized in real time <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </motion.div>

            {/* Tall feature */}
            <motion.div
              variants={fadeUp}
              custom={1}
              whileHover={{ y: -3 }}
              className="md:col-span-2 md:row-span-2 glass rounded-3xl p-7 relative overflow-hidden group cursor-default"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/15 to-transparent opacity-80" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-xl text-foreground mb-2">AI Assistant</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Ask anything — from concepts to deadlines. Your study buddy is always online.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Small features */}
            {[
              { icon: MessageSquare, title: "Real-time Chat", desc: "DM peers & faculty instantly." },
              { icon: FileText, title: "Notes & Resources", desc: "Share, search, ace exams." },
              { icon: Users, title: "Study Partner", desc: "Find your subject squad." },
              { icon: Ghost, title: "Confession Wall", desc: "Anonymous, moderated." },
              { icon: Tag, title: "Marketplace", desc: "Buy, sell, swap on campus." },
              { icon: Shield, title: "Safe & Verified", desc: "NLP moderation, real IDs." },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                custom={i + 2}
                whileHover={{ y: -3 }}
                className="md:col-span-2 glass rounded-3xl p-6 relative overflow-hidden group cursor-default"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:gradient-primary transition-all">
                    <f.icon className="h-4.5 w-4.5 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-base text-foreground">{f.title}</h4>
                    <p className="text-muted-foreground text-sm leading-snug mt-0.5">{f.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative py-28 px-6 border-t border-border/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-16 max-w-2xl mx-auto"
          >
            <motion.p variants={fadeUp} custom={0} className="text-primary font-semibold text-xs uppercase tracking-widest mb-3">
              How it works
            </motion.p>
            <motion.h3 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-display font-bold text-foreground text-balance">
              From sign-up to{" "}
              <span className="gradient-text">campus famous</span> in 3 steps
            </motion.h3>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-5 relative"
          >
            {[
              {
                icon: UserPlus,
                step: "01",
                title: "Create your profile",
                desc: "Sign up with your university email. Add your batch, semester, and academic interests.",
              },
              {
                icon: Compass,
                step: "02",
                title: "Discover your circle",
                desc: "Follow classmates, faculty, and subjects. Your feed gets smarter as you engage.",
              },
              {
                icon: Rocket,
                step: "03",
                title: "Share & grow",
                desc: "Post updates, swap notes, join study groups, and build connections that last.",
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                variants={fadeUp}
                custom={i}
                className="glass rounded-2xl p-7 relative overflow-hidden group"
              >
                <span className="absolute top-5 right-6 text-5xl font-display font-bold text-primary/10 group-hover:text-primary/20 transition-colors">
                  {s.step}
                </span>
                <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center mb-5">
                  <s.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h4 className="font-display font-semibold text-lg text-foreground mb-2">{s.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-28 px-6 border-t border-border/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} custom={0} className="text-primary font-semibold text-xs uppercase tracking-widest mb-3">
              Loved on campus
            </motion.p>
            <motion.h3 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-display font-bold text-foreground text-balance">
              The campus voice, <span className="gradient-text">unfiltered</span>
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
                quote: "Found my entire study group on UniVerse in week one. Best decision of the semester.",
                name: "Ayesha K.",
                role: "BSCS, Semester 5",
              },
              {
                quote: "The notes section is a literal lifesaver. Pre-exam week feels less terrifying now.",
                name: "Hamza R.",
                role: "BSSE, Semester 7",
              },
              {
                quote: "Finally a campus app that doesn't feel like a 2010 forum. Clean, fast, and actually fun.",
                name: "Zara M.",
                role: "BBA, Semester 3",
              },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                custom={i}
                className="glass rounded-2xl p-7 flex flex-col gap-4"
              >
                <div className="flex gap-0.5 text-primary">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-foreground/90 leading-relaxed flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-border/30">
                  <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-display font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="glass rounded-[2rem] p-12 md:p-16 relative overflow-hidden noise text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative z-10">
              <BookOpen className="h-10 w-10 text-primary mx-auto mb-5 animate-pulse-glow" />
              <h3 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4 text-balance tracking-tight">
                Your campus is waiting.
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Join thousands of students and faculty already building their academic world on UniVerse.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register">
                  <Button size="lg" className="gradient-primary text-primary-foreground font-bold rounded-full px-10 h-12 glow-border w-full sm:w-auto">
                    Create free account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="rounded-full px-10 h-12 border-border/60 w-full sm:w-auto">
                    Sign in
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mt-6">Free forever for students • No card required</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md gradient-primary flex items-center justify-center">
              <GraduationCap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg gradient-text">UniVerse</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <Link to="/login" className="hover:text-foreground transition-colors">Sign in</Link>
          </div>
          <p className="text-muted-foreground text-sm">© 2026 UniVerse</p>
        </div>
      </footer>
    </div>
  );
}
