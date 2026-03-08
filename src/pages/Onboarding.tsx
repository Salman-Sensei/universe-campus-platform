import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Check, ChevronRight, ChevronLeft, User, Camera, Users, BookOpen, Loader2, UserPlus, UserCheck } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const STEPS = ["Username", "Avatar", "Role", "Follow"];

const AVATAR_OPTIONS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=student1",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=student2",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=student3",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=faculty1",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=faculty2",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=faculty3",
  "https://api.dicebear.com/7.x/bottts/svg?seed=bot1",
  "https://api.dicebear.com/7.x/bottts/svg?seed=bot2",
];

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [customAvatar, setCustomAvatar] = useState<File | null>(null);
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string | null>(null);
  const [role, setRole] = useState<"student" | "faculty" | "">("");
  const [semester, setSemester] = useState("");
  const [batch, setBatch] = useState("");
  const [subjects, setSubjects] = useState("");
  const [saving, setSaving] = useState(false);

  // Follow step
  const [suggestedUsers, setSuggestedUsers] = useState<Tables<"profiles">[]>([]);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Check username availability
  useEffect(() => {
    if (username.length < 3) { setUsernameAvailable(null); return; }
    const timeout = setTimeout(async () => {
      setCheckingUsername(true);
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username.toLowerCase())
        .neq("user_id", user?.id || "")
        .maybeSingle();
      setUsernameAvailable(!data);
      setCheckingUsername(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [username, user]);

  // Load suggested users for follow step
  useEffect(() => {
    if (step === 3) {
      setLoadingUsers(true);
      supabase.from("profiles").select("*").neq("user_id", user?.id || "").limit(20)
        .then(({ data }) => {
          if (data) setSuggestedUsers(data);
          setLoadingUsers(false);
        });
    }
  }, [step, user]);

  const handleCustomAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomAvatar(file);
      setCustomAvatarPreview(URL.createObjectURL(file));
      setSelectedAvatar("");
    }
  };

  const toggleFollow = async (targetId: string) => {
    if (!user) return;
    const newSet = new Set(followedUsers);
    if (newSet.has(targetId)) {
      newSet.delete(targetId);
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", targetId);
    } else {
      newSet.add(targetId);
      await supabase.from("follows").insert({ follower_id: user.id, following_id: targetId });
    }
    setFollowedUsers(newSet);
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);

    let avatarUrl = selectedAvatar;
    if (customAvatar) {
      const ext = customAvatar.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      await supabase.storage.from("avatars").upload(path, customAvatar, { upsert: true });
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      avatarUrl = data.publicUrl;
    }

    const updateData: Record<string, any> = {
      username: username.toLowerCase(),
      display_name: username,
      avatar_url: avatarUrl || null,
      role,
      onboarding_completed: true,
    };
    if (role === "student") {
      updateData.semester = semester || null;
      updateData.batch = batch || null;
    } else if (role === "faculty") {
      updateData.subjects = subjects ? subjects.split(",").map(s => s.trim()).filter(Boolean) : null;
    }

    const { error } = await supabase.from("profiles").update(updateData).eq("user_id", user.id);
    if (error) {
      toast.error("Failed to save profile");
      setSaving(false);
      return;
    }

    toast.success("Welcome to UniVerse! 🎓");
    navigate("/feed");
    setSaving(false);
  };

  const canProceed = () => {
    if (step === 0) return username.length >= 3 && usernameAvailable === true;
    if (step === 1) return !!(selectedAvatar || customAvatarPreview);
    if (step === 2) {
      if (!role) return false;
      if (role === "student") return !!semester && !!batch;
      if (role === "faculty") return !!subjects.trim();
      return true;
    }
    if (step === 3) return followedUsers.size >= 3;
    return true;
  };

  const currentAvatar = customAvatarPreview || selectedAvatar;

  return (
    <div className="min-h-screen flex items-center justify-center gradient-mesh px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-lg glass rounded-3xl p-8 noise"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <GraduationCap className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg gradient-text">UniVerse</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">Set up your profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Step {step + 1} of {STEPS.length}</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all duration-300 ${i <= step ? "gradient-primary" : "bg-surface"}`} />
              <p className={`text-[10px] mt-1 text-center font-medium ${i === step ? "text-primary" : "text-muted-foreground"}`}>{s}</p>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="username" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="text-center mb-6">
                <User className="h-10 w-10 text-primary mx-auto mb-2" />
                <h2 className="font-display font-semibold text-lg text-foreground">Choose your username</h2>
                <p className="text-sm text-muted-foreground">This is how others will find you</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Username</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                  className="bg-surface/60 border-border/40 rounded-xl h-12 text-lg focus:ring-1 focus:ring-primary/30"
                  placeholder="johndoe"
                />
                {username.length >= 3 && (
                  <div className="flex items-center gap-2 text-sm">
                    {checkingUsername ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" /><span className="text-muted-foreground">Checking...</span></>
                    ) : usernameAvailable ? (
                      <><Check className="h-3.5 w-3.5 text-success" /><span className="text-success">Available!</span></>
                    ) : (
                      <span className="text-destructive">Username taken</span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="avatar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="text-center mb-6">
                <Camera className="h-10 w-10 text-primary mx-auto mb-2" />
                <h2 className="font-display font-semibold text-lg text-foreground">Pick your avatar</h2>
                <p className="text-sm text-muted-foreground">Choose one or upload your own</p>
              </div>
              {currentAvatar && (
                <div className="flex justify-center mb-4">
                  <Avatar className="h-20 w-20 ring-4 ring-primary/30">
                    <AvatarImage src={currentAvatar} />
                    <AvatarFallback className="bg-surface text-primary text-2xl">{username.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
              )}
              <div className="grid grid-cols-4 gap-3">
                {AVATAR_OPTIONS.map((url) => (
                  <button
                    key={url}
                    onClick={() => { setSelectedAvatar(url); setCustomAvatar(null); setCustomAvatarPreview(null); }}
                    className={`rounded-xl p-2 transition-all duration-200 ${selectedAvatar === url ? "ring-2 ring-primary bg-primary/10" : "bg-surface/60 hover:bg-surface-hover"}`}
                  >
                    <img src={url} alt="Avatar" className="w-full aspect-square rounded-lg" />
                  </button>
                ))}
              </div>
              <label className="block cursor-pointer text-center">
                <div className="bg-surface/60 rounded-xl px-4 py-3 text-sm text-muted-foreground hover:bg-surface-hover transition-colors border border-dashed border-border/60">
                  📷 Upload custom photo
                </div>
                <input type="file" accept="image/*" onChange={handleCustomAvatar} className="hidden" />
              </label>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="role" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="text-center mb-6">
                <BookOpen className="h-10 w-10 text-primary mx-auto mb-2" />
                <h2 className="font-display font-semibold text-lg text-foreground">Your academic role</h2>
                <p className="text-sm text-muted-foreground">Tell us about your position</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRole("student")}
                  className={`rounded-xl p-5 text-center transition-all duration-200 ${role === "student" ? "ring-2 ring-primary bg-primary/10" : "bg-surface/60 hover:bg-surface-hover"}`}
                >
                  <GraduationCap className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-semibold text-foreground">Student</p>
                </button>
                <button
                  onClick={() => setRole("faculty")}
                  className={`rounded-xl p-5 text-center transition-all duration-200 ${role === "faculty" ? "ring-2 ring-accent bg-accent/10" : "bg-surface/60 hover:bg-surface-hover"}`}
                >
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-accent" />
                  <p className="font-semibold text-foreground">Faculty</p>
                </button>
              </div>
              {role === "student" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3 overflow-hidden">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Semester</Label>
                    <Input value={semester} onChange={(e) => setSemester(e.target.value)} className="bg-surface/60 border-border/40 rounded-xl h-11 focus:ring-1 focus:ring-primary/30" placeholder="e.g. 5th Semester" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Batch</Label>
                    <Input value={batch} onChange={(e) => setBatch(e.target.value)} className="bg-surface/60 border-border/40 rounded-xl h-11 focus:ring-1 focus:ring-primary/30" placeholder="e.g. 2023-2027" />
                  </div>
                </motion.div>
              )}
              {role === "faculty" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3 overflow-hidden">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Subjects Taught (comma separated)</Label>
                    <Input value={subjects} onChange={(e) => setSubjects(e.target.value)} className="bg-surface/60 border-border/40 rounded-xl h-11 focus:ring-1 focus:ring-primary/30" placeholder="e.g. Data Structures, Algorithms, AI" />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="follow" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="text-center mb-4">
                <Users className="h-10 w-10 text-primary mx-auto mb-2" />
                <h2 className="font-display font-semibold text-lg text-foreground">Follow at least 3 people</h2>
                <p className="text-sm text-muted-foreground">
                  {followedUsers.size}/3 followed {followedUsers.size >= 3 && <Check className="inline h-4 w-4 text-success" />}
                </p>
              </div>
              {loadingUsers ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : suggestedUsers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">No users to follow yet. You can skip this step.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {suggestedUsers.map((p) => {
                    const name = p.display_name || p.username || "User";
                    const isFollowed = followedUsers.has(p.user_id);
                    return (
                      <div key={p.id} className="flex items-center gap-3 bg-surface/60 rounded-xl p-3">
                        <Avatar className="h-10 w-10 ring-2 ring-border/40">
                          <AvatarImage src={p.avatar_url || undefined} />
                          <AvatarFallback className="bg-surface text-primary font-semibold text-xs">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                          {(p as any).role && (
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${(p as any).role === "faculty" ? "role-badge-faculty" : "role-badge-student"}`}>
                              {(p as any).role === "faculty" ? "Faculty" : "Student"}
                            </span>
                          )}
                        </div>
                        <Button
                          onClick={() => toggleFollow(p.user_id)}
                          variant={isFollowed ? "secondary" : "default"}
                          size="sm"
                          className={`rounded-xl shrink-0 ${isFollowed ? "bg-surface-hover" : "gradient-primary text-primary-foreground font-semibold"}`}
                        >
                          {isFollowed ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)} className="rounded-xl text-muted-foreground">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          ) : <div />}
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="gradient-primary text-primary-foreground font-semibold rounded-xl">
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={saving || !canProceed()} className="gradient-primary text-primary-foreground font-semibold rounded-xl">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
              {saving ? "Saving..." : "Finish Setup"}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}