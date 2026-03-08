import { AppLayout } from "@/components/AppLayout";
import { motion } from "framer-motion";
import { BookOpen, Home, MessageCircle, Users, Ghost, ShoppingBag, FileText, GraduationCap, Flame, Camera, Heart, UserPlus, Lightbulb, Globe, Crown, CheckCircle2, Mail, Linkedin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const features = [
  { icon: Home, title: "Home Feed", desc: "Your main timeline showing posts from people you follow and trending campus content. Like, comment, and share posts." },
  { icon: Camera, title: "Stories", desc: "Share 24-hour updates with photos and text. View stories from classmates in the horizontal bar at the top of your feed." },
  { icon: MessageCircle, title: "Posts & Comments", desc: "Create text and image posts. Comment on others' posts to start academic discussions and campus conversations." },
  { icon: UserPlus, title: "Followers", desc: "Follow classmates and faculty to build your academic network. See their posts in your feed." },
  { icon: Users, title: "Communities", desc: "Join department-based communities like Software Engineering, AI, and Data Science to connect with peers." },
  { icon: Flame, title: "Events", desc: "Discover campus events — hackathons, seminars, study groups, and project meetings. RSVP and never miss out." },
  { icon: GraduationCap, title: "Study Partner Finder", desc: "Find study partners by subject, semester, and availability. Join study sessions and ace your exams together." },
  { icon: FileText, title: "Notes Hub", desc: "Upload and download lecture notes, past papers, assignments, and study guides. Search by course and semester." },
  { icon: ShoppingBag, title: "Marketplace", desc: "Buy and sell textbooks, electronics, calculators, and more. List items with photos and prices." },
  { icon: Ghost, title: "Confession Wall", desc: "Share anonymous confessions. React and comment on others' confessions in a safe space." },
];

const tips = [
  "Follow your classmates and faculty to build your academic network",
  "Share your lecture notes to help others and earn reputation points",
  "Join communities related to your department and interests",
  "Use the Study Partner Finder before exams to form study groups",
  "Post campus marketplace listings for textbooks you no longer need",
  "Participate in discussions to become a Top Contributor",
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function HowToUse() {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto pb-16 px-4">
        {/* Hero */}
        <motion.div {...fadeUp} className="text-center py-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <BookOpen className="h-4 w-4" />
            Platform Guide
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            How To Use <span className="gradient-text">UniVerse</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            UniVerse is a digital campus network designed for students and faculty to connect, collaborate, and share knowledge.
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.section {...fadeUp} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6 md:p-8 mb-8 hover:translate-y-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
              <Globe className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground">Welcome to UniVerse</h2>
          </div>
          <p className="text-foreground/80 leading-relaxed">
            UniVerse brings your entire university experience online. Whether you're looking for study partners, 
            sharing lecture notes, buying textbooks, or simply staying connected with campus life — UniVerse is your 
            all-in-one platform. Built for students, by students.
          </p>
        </motion.section>

        {/* Features Grid */}
        <motion.section {...fadeUp} transition={{ delay: 0.2 }} className="mb-8">
          <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            Main Features
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="glass-card rounded-2xl p-5 group"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Tips */}
        <motion.section {...fadeUp} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-6 md:p-8 mb-8 hover:translate-y-0">
          <h2 className="text-xl font-display font-bold text-foreground mb-5 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Tips for Students
          </h2>
          <div className="space-y-3">
            {tips.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-start gap-3"
              >
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                </div>
                <p className="text-foreground/80 text-sm leading-relaxed">{tip}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Platform Purpose */}
        <motion.section {...fadeUp} transition={{ delay: 0.4 }} className="glass-card rounded-2xl p-6 md:p-8 mb-8 hover:translate-y-0 border-primary/20">
          <h2 className="text-xl font-display font-bold text-foreground mb-3">🎯 Platform Purpose</h2>
          <p className="text-foreground/80 leading-relaxed">
            UniVerse is designed for <strong className="text-foreground">academic collaboration</strong> and <strong className="text-foreground">campus interaction</strong>. 
            It bridges the gap between classroom learning and digital networking, creating a space where every student and faculty member 
            can contribute to a vibrant academic community. From sharing resources to finding study partners, 
            UniVerse empowers your university journey.
          </p>
        </motion.section>

        {/* Creator Credit */}
        <motion.section
          {...fadeUp}
          transition={{ delay: 0.5 }}
          className="rounded-2xl overflow-hidden"
        >
          <div className="relative p-8 md:p-10">
            <div className="absolute inset-0 gradient-primary opacity-10" />
            <div className="absolute inset-0 noise" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Crown className="h-5 w-5 text-warning" />
                <h2 className="text-xl font-display font-bold text-foreground">Created By</h2>
              </div>
              
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-warning via-accent to-primary p-[2px]">
                    <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                      <span className="text-2xl font-display font-bold gradient-text">SK</span>
                    </div>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-1 -right-1"
                  >
                    <span className="flex items-center gap-0.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-warning via-accent to-primary text-primary-foreground shadow-lg">
                      <Crown className="h-2 w-2" />
                      Founder
                      <CheckCircle2 className="h-2 w-2" />
                    </span>
                  </motion.div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-display font-bold text-foreground mb-1">Salman Khan</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    UniVerse was designed and developed by Salman Khan to create a modern digital campus where students and faculty can connect, collaborate, and share knowledge.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a href="mailto:skbkhan31@gmail.com" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors bg-surface/50 px-3 py-1.5 rounded-full border border-border/30">
                      <Mail className="h-3.5 w-3.5" />
                      skbkhan31@gmail.com
                    </a>
                    <a href="https://www.linkedin.com/in/salmankhan-developer/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors bg-surface/50 px-3 py-1.5 rounded-full border border-border/30">
                      <Linkedin className="h-3.5 w-3.5" />
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </AppLayout>
  );
}
