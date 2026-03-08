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
import {
  Plus, Search, FileText, Download, BookOpen, GraduationCap,
  FileSpreadsheet, ClipboardList, BookMarked, Upload, File,
} from "lucide-react";

const CATEGORIES = [
  { value: "lecture_notes", label: "Lecture Notes", icon: BookOpen },
  { value: "past_papers", label: "Past Papers", icon: FileSpreadsheet },
  { value: "assignments", label: "Assignments", icon: ClipboardList },
  { value: "study_guides", label: "Study Guides", icon: BookMarked },
];

const SUBJECTS = [
  "Operating Systems", "Data Structures", "Database Systems", "Web Engineering",
  "Artificial Intelligence", "Machine Learning", "Computer Networks", "Software Engineering",
  "Discrete Mathematics", "Calculus", "Linear Algebra", "OOP", "Cloud Computing",
  "Cybersecurity", "Mobile App Development", "Theory of Automata", "Digital Logic Design",
  "Compiler Construction", "Software Testing", "DevOps", "Other",
];

const SEMESTERS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

function getCategoryMeta(cat: string) {
  return CATEGORIES.find((c) => c.value === cat) || CATEGORIES[0];
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function NotesResources() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterSemester, setFilterSemester] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("lecture_notes");
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["notes-resources", filterCategory, filterSubject, filterSemester, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("notes_resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterCategory !== "all") query = query.eq("category", filterCategory);
      if (filterSubject !== "all") query = query.eq("subject", filterSubject);
      if (filterSemester !== "all") query = query.eq("semester", filterSemester);
      if (searchQuery.trim()) query = query.ilike("title", `%${searchQuery.trim()}%`);

      const { data, error } = await query;
      if (error) throw error;

      const userIds = [...new Set((data || []).map((r: any) => r.user_id))];
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = Object.fromEntries((profiles || []).map((p: any) => [p.user_id, p]));
      return (data || []).map((r: any) => ({ ...r, uploader: profileMap[r.user_id] || null }));
    },
  });

  const uploadResource = useMutation({
    mutationFn: async () => {
      if (!user || !file) throw new Error("Missing data");

      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("notes").upload(path, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("notes").getPublicUrl(path);

      const { error } = await supabase.from("notes_resources").insert({
        user_id: user.id,
        title,
        description: description || null,
        category,
        subject,
        semester: semester || null,
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_size: file.size,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes-resources"] });
      toast.success("Resource uploaded!");
      setDialogOpen(false);
      setTitle("");
      setDescription("");
      setCategory("lecture_notes");
      setSubject("");
      setSemester("");
      setFile(null);
    },
    onError: () => toast.error("Failed to upload resource"),
  });

  const handleDownload = async (resource: any) => {
    window.open(resource.file_url, "_blank");
    // Increment download count
    await supabase
      .from("notes_resources")
      .update({ downloads: (resource.downloads || 0) + 1 })
      .eq("id", resource.id);
    queryClient.invalidateQueries({ queryKey: ["notes-resources"] });
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Notes & Resources
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Share and discover study materials</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl gap-2">
                <Upload className="h-4 w-4" /> Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">Upload Resource</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <Input placeholder="Title (e.g. OS Mid-Term Notes)" value={title} onChange={(e) => setTitle(e.target.value)} />
                <Textarea placeholder="Brief description..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
                <div className="flex gap-3">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={semester} onValueChange={setSemester}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Semester" /></SelectTrigger>
                    <SelectContent>
                      {SEMESTERS.map((s) => (
                        <SelectItem key={s} value={s}>{s} Semester</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger><SelectValue placeholder="Choose subject" /></SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1.5">File (PDF, DOCX, PPTX, etc.)</label>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </div>
                <Button
                  className="w-full rounded-xl"
                  disabled={!title.trim() || !subject || !file || uploadResource.isPending}
                  onClick={() => uploadResource.mutate()}
                >
                  {uploadResource.isPending ? "Uploading..." : "Upload Resource"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes & resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[150px] rounded-xl text-xs h-8">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-[170px] rounded-xl text-xs h-8">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSemester} onValueChange={setFilterSemester}>
              <SelectTrigger className="w-[140px] rounded-xl text-xs h-8">
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {SEMESTERS.map((s) => (
                  <SelectItem key={s} value={s}>{s} Semester</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resources List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-surface animate-pulse" />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No resources found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Be the first to share study materials!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {resources.map((res: any, idx: number) => {
                const catMeta = getCategoryMeta(res.category);
                const CatIcon = catMeta.icon;

                return (
                  <motion.div
                    key={res.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <Card className="rounded-2xl border-border/40 hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-center gap-4">
                        {/* Icon */}
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <CatIcon className="h-6 w-6 text-primary" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground truncate">{res.title}</h3>
                            <Badge variant="secondary" className="rounded-full text-[10px] shrink-0">
                              {catMeta.label}
                            </Badge>
                          </div>
                          {res.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{res.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" /> {res.subject}
                            </span>
                            {res.semester && (
                              <span className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3" /> {res.semester} Sem
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <File className="h-3 w-3" /> {formatFileSize(res.file_size || 0)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="h-3 w-3" /> {res.downloads}
                            </span>
                          </div>
                        </div>

                        {/* Uploader + Download */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="hidden sm:flex items-center gap-1.5">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={res.uploader?.avatar_url || undefined} />
                              <AvatarFallback className="text-[9px] bg-surface text-primary font-bold">
                                {(res.uploader?.display_name || "U").slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground max-w-[80px] truncate">
                              {res.uploader?.display_name || res.uploader?.username || "Unknown"}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full text-xs gap-1"
                            onClick={() => handleDownload(res)}
                          >
                            <Download className="h-3.5 w-3.5" /> Download
                          </Button>
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
