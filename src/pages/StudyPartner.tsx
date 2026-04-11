import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Clock, BookOpen, GraduationCap, UserPlus, UserCheck, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SUBJECTS = [
  "Operating Systems", "Data Structures", "Database Systems", "Web Engineering",
  "Artificial Intelligence", "Machine Learning", "Computer Networks", "Software Engineering",
  "Discrete Mathematics", "Calculus", "Linear Algebra", "OOP", "Cloud Computing",
  "Cybersecurity", "Mobile App Development", "Theory of Automata", "Digital Logic Design",
  "Compiler Construction", "Software Testing", "DevOps", "Other",
];

const SEMESTERS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

const TIME_SLOTS = [
  "Today morning", "Today afternoon", "Today evening", "Tonight",
  "Tomorrow morning", "Tomorrow afternoon", "Tomorrow evening",
  "This weekend", "Flexible",
];

export default function StudyPartner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterSubject, setFilterSubject] = useState("all");

  // Form
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState("");
  const [timeAvailable, setTimeAvailable] = useState("");
  const [description, setDescription] = useState("");

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["study-requests", filterSubject],
    queryFn: async () => {
      let query = supabase
        .from("study_requests")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (filterSubject !== "all") {
        query = query.eq("subject", filterSubject);
      }

      const { data, error } = await query;
      if (error) throw error;

      const userIds = [...new Set((data || []).map((r: any) => r.user_id))];
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url, semester")
        .in("user_id", userIds);

      const profileMap = Object.fromEntries((profiles || []).map((p: any) => [p.user_id, p]));

      // Get participants for each request
      const requestIds = (data || []).map((r: any) => r.id);
      const { data: participants } = await supabase
        .from("study_request_participants")
        .select("request_id, user_id")
        .in("request_id", requestIds);

      const partMap: Record<string, string[]> = {};
      (participants || []).forEach((p: any) => {
        if (!partMap[p.request_id]) partMap[p.request_id] = [];
        partMap[p.request_id].push(p.user_id);
      });

      return (data || []).map((r: any) => ({
        ...r,
        creator: profileMap[r.user_id] || null,
        participants: partMap[r.id] || [],
      }));
    },
  });

  const createRequest = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("study_requests").insert({
        user_id: user.id,
        subject,
        semester: semester || null,
        time_available: timeAvailable,
        description,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-requests"] });
      toast.success("Study request posted!");
      setDialogOpen(false);
      setSubject("");
      setSemester("");
      setTimeAvailable("");
      setDescription("");
    },
    onError: () => toast.error("Failed to create request"),
  });

  const joinRequest = useMutation({
    mutationFn: async (requestId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("study_request_participants").insert({
        request_id: requestId,
        user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-requests"] });
      toast.success("Joined study session!");
    },
    onError: () => toast.error("Could not join"),
  });

  const leaveRequest = useMutation({
    mutationFn: async (requestId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("study_request_participants")
        .delete()
        .eq("request_id", requestId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-requests"] });
      toast.success("Left study session");
    },
  });

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Find Study Partner
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Connect with classmates for study sessions</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl gap-2">
                <Plus className="h-4 w-4" /> New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">Create Study Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger><SelectValue placeholder="Choose subject" /></SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-3">
                  <Select value={semester} onValueChange={setSemester}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Semester" /></SelectTrigger>
                    <SelectContent>
                      {SEMESTERS.map((s) => (
                        <SelectItem key={s} value={s}>{s} Semester</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={timeAvailable} onValueChange={setTimeAvailable}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="When?" /></SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  placeholder='e.g. "Looking for someone to study Operating Systems tonight."'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
                <Button
                  className="w-full rounded-xl"
                  disabled={!subject || !timeAvailable || !description.trim() || createRequest.isPending}
                  onClick={() => createRequest.mutate()}
                >
                  {createRequest.isPending ? "Posting..." : "Post Study Request"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Subject Filter */}
        <div className="flex gap-1.5 flex-wrap">
          <Button
            variant={filterSubject === "all" ? "default" : "outline"}
            size="sm"
            className="rounded-full text-xs"
            onClick={() => setFilterSubject("all")}
          >
            All Subjects
          </Button>
          {SUBJECTS.slice(0, 8).map((s) => (
            <Button
              key={s}
              variant={filterSubject === s ? "default" : "outline"}
              size="sm"
              className="rounded-full text-xs"
              onClick={() => setFilterSubject(s)}
            >
              {s}
            </Button>
          ))}
        </div>

        {/* Requests */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-2xl bg-surface animate-pulse" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No study requests yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Create one and find your study partner!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {requests.map((req: any, idx: number) => {
                const hasJoined = user && req.participants.includes(user.id);
                const isOwner = user && req.user_id === user.id;
                const spotsLeft = req.max_partners - req.participants.length;

                return (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <Card className="rounded-2xl border-border/40 hover:shadow-md transition-shadow">
                      <CardContent className="p-5 space-y-3">
                        {/* Top row: subject + time */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="rounded-full gap-1 bg-primary/10 text-primary border-0">
                              <BookOpen className="h-3 w-3" /> {req.subject}
                            </Badge>
                            {req.semester && (
                              <Badge variant="outline" className="rounded-full gap-1 text-xs">
                                <GraduationCap className="h-3 w-3" /> {req.semester} Sem
                              </Badge>
                            )}
                          </div>
                          <Badge variant="secondary" className="rounded-full gap-1 text-xs shrink-0">
                            <Clock className="h-3 w-3" /> {req.time_available}
                          </Badge>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-foreground/90 leading-relaxed">{req.description}</p>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-border/30">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={req.creator?.avatar_url || undefined} />
                              <AvatarFallback className="text-[10px] bg-surface text-primary font-bold">
                                {(req.creator?.display_name || "U").slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {req.creator?.display_name || req.creator?.username || "Unknown"}
                            </span>
                            <span className="text-xs text-muted-foreground/60">·</span>
                            <span className="text-xs text-muted-foreground/60">
                              {req.participants.length} joined · {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            {isOwner ? (
                              <Badge variant="outline" className="rounded-full text-xs">Your request</Badge>
                            ) : hasJoined ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full text-xs gap-1"
                                onClick={() => leaveRequest.mutate(req.id)}
                              >
                                <UserCheck className="h-3.5 w-3.5" /> Joined
                              </Button>
                            ) : spotsLeft > 0 ? (
                              <Button
                                size="sm"
                                className="rounded-full text-xs gap-1"
                                onClick={() => joinRequest.mutate(req.id)}
                              >
                                <UserPlus className="h-3.5 w-3.5" /> Join
                              </Button>
                            ) : (
                              <Badge variant="secondary" className="rounded-full text-xs">Full</Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-full text-xs gap-1 text-primary hover:bg-primary/10"
                              onClick={() => {
                                if (!user) return toast.error("Sign in to message");
                                navigate(`/messages?userId=${req.user_id}`);
                              }}
                            >
                              <MessageCircle className="h-3.5 w-3.5" /> Message
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
