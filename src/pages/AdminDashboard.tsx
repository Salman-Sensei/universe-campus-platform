import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Trash2, Pencil, UserPlus, Plus, Shield, BookOpen, ShoppingBag, FileText, Calendar, Users as UsersIcon, Ghost, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

function ConfirmDeleteButton({ onConfirm, label = "this item" }: { onConfirm: () => void; label?: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-destructive shrink-0">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {label}?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// --- Users Tab ---
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ display_name: "", bio: "", semester: "", batch: "", role: "" });

  const load = async () => {
    const [{ data: profiles }, { data: userRoles }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
    ]);
    setUsers(profiles || []);
    setRoles(userRoles || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const getUserRole = (userId: string) => {
    const r = roles.find((r) => r.user_id === userId);
    return r?.role || "user";
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    // Remove existing roles
    await supabase.from("user_roles").delete().eq("user_id", userId);
    if (newRole !== "user") {
      await supabase.from("user_roles").insert({ user_id: userId, role: newRole as any });
    }
    toast.success("Role updated");
    load();
  };

  const handleEditProfile = async () => {
    if (!editUser) return;
    await supabase.from("profiles").update({
      display_name: editForm.display_name || null,
      bio: editForm.bio || null,
      semester: editForm.semester || null,
      batch: editForm.batch || null,
      role: editForm.role || null,
    }).eq("user_id", editUser.user_id);
    toast.success("Profile updated");
    setEditUser(null);
    load();
  };

  const openEdit = (user: any) => {
    setEditUser(user);
    setEditForm({
      display_name: user.display_name || "",
      bio: user.bio || "",
      semester: user.semester || "",
      batch: user.batch || "",
      role: user.role || "student",
    });
  };

  const filtered = users.filter((u) =>
    (u.display_name || u.username || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      <div className="rounded-xl border border-border/40 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left p-3 font-medium">User</th>
              <th className="text-left p-3 font-medium">Username</th>
              <th className="text-left p-3 font-medium">Profile Role</th>
              <th className="text-left p-3 font-medium">System Role</th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t border-border/20 hover:bg-muted/10">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={u.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">{(u.display_name || u.username || "?").slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{u.display_name || "Unnamed"}</span>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">@{u.username || "—"}</td>
                <td className="p-3">
                  <Badge variant="outline" className="capitalize">{u.role || "student"}</Badge>
                </td>
                <td className="p-3">
                  <Select value={getUserRole(u.user_id)} onValueChange={(v) => handleRoleChange(u.user_id, v)}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-3">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(u)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit User: {editUser?.display_name || editUser?.username}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Display Name</Label><Input value={editForm.display_name} onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })} /></div>
            <div><Label>Bio</Label><Input value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} /></div>
            <div><Label>Semester</Label>
              <Select value={editForm.semester} onValueChange={(v) => setEditForm({ ...editForm, semester: v })}>
                <SelectTrigger><SelectValue placeholder="Select semester" /></SelectTrigger>
                <SelectContent>{["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"].map((s) => <SelectItem key={s} value={s}>{s} Semester</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Batch</Label><Input value={editForm.batch} onChange={(e) => setEditForm({ ...editForm, batch: e.target.value })} /></div>
            <div><Label>Profile Role</Label>
              <Select value={editForm.role} onValueChange={(v) => setEditForm({ ...editForm, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleEditProfile} className="w-full">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Subjects Tab ---
function SubjectsTab() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editSubject, setEditSubject] = useState<any>(null);
  const [form, setForm] = useState({ name: "", code: "", department: "", semester: "" });

  const load = async () => {
    const { data } = await supabase.from("subjects").select("*").order("name");
    setSubjects(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.name) { toast.error("Name required"); return; }
    const { error } = await supabase.from("subjects").insert({ name: form.name, code: form.code || null, department: form.department || null, semester: form.semester || null });
    if (error) toast.error(error.message);
    else { toast.success("Subject added"); setShowAdd(false); setForm({ name: "", code: "", department: "", semester: "" }); load(); }
  };

  const handleUpdate = async () => {
    if (!editSubject) return;
    await supabase.from("subjects").update({ name: form.name, code: form.code || null, department: form.department || null, semester: form.semester || null }).eq("id", editSubject.id);
    toast.success("Subject updated");
    setEditSubject(null);
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("subjects").delete().eq("id", id);
    toast.success("Subject deleted");
    load();
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const SubjectForm = ({ onSave, title }: { onSave: () => void; title: string }) => (
    <div className="space-y-3">
      <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
      <div><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. CS-201" /></div>
      <div><Label>Department</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
      <div><Label>Semester</Label>
        <Select value={form.semester} onValueChange={(v) => setForm({ ...form, semester: v })}>
          <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
          <SelectContent>{["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <Button onClick={onSave} className="w-full">{title}</Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{subjects.length} Subjects</h3>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Subject</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Subject</DialogTitle></DialogHeader>
            <SubjectForm onSave={handleAdd} title="Add Subject" />
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-3">
        {subjects.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-card">
            <div>
              <p className="font-medium">{s.name}</p>
              <p className="text-xs text-muted-foreground">{[s.code, s.department, s.semester && `${s.semester} Sem`].filter(Boolean).join(" · ") || "No details"}</p>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => { setEditSubject(s); setForm({ name: s.name, code: s.code || "", department: s.department || "", semester: s.semester || "" }); }}>
                <Pencil className="h-4 w-4" />
              </Button>
              <ConfirmDeleteButton onConfirm={() => handleDelete(s.id)} label="this subject" />
            </div>
          </div>
        ))}
        {subjects.length === 0 && <p className="text-center text-muted-foreground py-8">No subjects yet</p>}
      </div>

      <Dialog open={!!editSubject} onOpenChange={(o) => !o && setEditSubject(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Subject</DialogTitle></DialogHeader>
          <SubjectForm onSave={handleUpdate} title="Update Subject" />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Posts Tab ---
function PostsTab() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from("posts").select("*, profiles!posts_user_id_profiles_fkey(display_name, username, avatar_url)").order("created_at", { ascending: false }).limit(50);
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    await supabase.from("posts").delete().eq("id", id);
    toast.success("Post deleted");
    load();
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{posts.length} recent posts</p>
      {posts.map((p) => (
        <div key={p.id} className="flex items-start justify-between p-3 rounded-xl border border-border/40 bg-card">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">@{p.profiles?.username || "unknown"}</p>
            <p className="text-sm truncate">{p.content}</p>
          </div>
          <ConfirmDeleteButton onConfirm={() => handleDelete(p.id)} label="this post" />
        </div>
      ))}
    </div>
  );
}

// --- Marketplace Tab ---
function MarketplaceTab() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from("marketplace_listings").select("*").order("created_at", { ascending: false });
    setListings(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    await supabase.from("marketplace_listings").delete().eq("id", id);
    toast.success("Listing deleted");
    load();
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{listings.length} listings</p>
      {listings.map((l) => (
        <div key={l.id} className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-card">
          <div>
            <p className="font-medium">{l.title}</p>
            <p className="text-xs text-muted-foreground">${l.price} · {l.category} · {l.status}</p>
          </div>
          <ConfirmDeleteButton onConfirm={() => handleDelete(l.id)} label="this listing" />
        </div>
      ))}
    </div>
  );
}

// --- Confessions Tab ---
function ConfessionsTab() {
  const [confessions, setConfessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from("confessions").select("*").order("created_at", { ascending: false }).limit(50);
    setConfessions(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    await supabase.from("confessions").delete().eq("id", id);
    toast.success("Confession deleted");
    load();
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{confessions.length} confessions</p>
      {confessions.map((c) => (
        <div key={c.id} className="flex items-start justify-between p-3 rounded-xl border border-border/40 bg-card">
          <p className="text-sm flex-1 min-w-0 truncate">{c.content}</p>
          <Button size="sm" variant="ghost" className="text-destructive shrink-0" onClick={() => handleDelete(c.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

// --- Events Tab ---
function EventsTab() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", event_date: "", location: "", category: "general" });

  const load = async () => {
    const { data } = await supabase.from("events").select("*").order("event_date", { ascending: true });
    setEvents(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.title || !form.event_date || !user) { toast.error("Title and date required"); return; }
    await supabase.from("events").insert({ ...form, created_by: user.id });
    toast.success("Event created");
    setShowAdd(false);
    setForm({ title: "", description: "", event_date: "", location: "", category: "general" });
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("events").delete().eq("id", id);
    toast.success("Event deleted");
    load();
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{events.length} Events</h3>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Event</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Event</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div><Label>Date & Time *</Label><Input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} /></div>
              <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div><Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["general", "hackathon", "seminar", "study_group", "workshop", "project_meeting"].map((c) => (
                      <SelectItem key={c} value={c}>{c.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd} className="w-full">Create Event</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {events.map((e) => (
        <div key={e.id} className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-card">
          <div>
            <p className="font-medium">{e.title}</p>
            <p className="text-xs text-muted-foreground">{new Date(e.event_date).toLocaleString()} · {e.category} · {e.location || "TBD"}</p>
          </div>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(e.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

// --- Communities Tab ---
function CommunitiesTab() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", icon: "" });

  const load = async () => {
    const { data } = await supabase.from("communities").select("*").order("name");
    setCommunities(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.name || !user) { toast.error("Name required"); return; }
    await supabase.from("communities").insert({ ...form, created_by: user.id });
    toast.success("Community created");
    setShowAdd(false);
    setForm({ name: "", description: "", icon: "" });
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("communities").delete().eq("id", id);
    toast.success("Community deleted");
    load();
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{communities.length} Communities</h3>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Community</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Community</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div><Label>Icon (emoji)</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🎓" /></div>
              <Button onClick={handleAdd} className="w-full">Create Community</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {communities.map((c) => (
        <div key={c.id} className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-card">
          <div className="flex items-center gap-2">
            <span className="text-xl">{c.icon || "🏫"}</span>
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.description || "No description"}</p>
            </div>
          </div>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(c.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

// --- Notes Tab ---
function NotesTab() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from("notes_resources").select("*").order("created_at", { ascending: false });
    setNotes(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    await supabase.from("notes_resources").delete().eq("id", id);
    toast.success("Note deleted");
    load();
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{notes.length} resources</p>
      {notes.map((n) => (
        <div key={n.id} className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-card">
          <div>
            <p className="font-medium">{n.title}</p>
            <p className="text-xs text-muted-foreground">{n.subject} · {n.category} · {n.downloads} downloads</p>
          </div>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(n.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

// --- Main Admin Dashboard ---
export default function AdminDashboard() {
  const { isAdmin, loading } = useAdmin();
  const { user } = useAuth();

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;
  if (!isAdmin) return <Navigate to="/feed" replace />;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto pb-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage your UniVerse platform</p>
            </div>
          </div>

          <Tabs defaultValue="users" className="space-y-4">
            <TabsList className="flex-wrap h-auto gap-1 bg-muted/30 p-1 rounded-xl">
              <TabsTrigger value="users" className="rounded-lg text-xs gap-1"><UsersIcon className="h-3.5 w-3.5" /> Users</TabsTrigger>
              <TabsTrigger value="subjects" className="rounded-lg text-xs gap-1"><BookOpen className="h-3.5 w-3.5" /> Subjects</TabsTrigger>
              <TabsTrigger value="posts" className="rounded-lg text-xs gap-1"><MessageCircle className="h-3.5 w-3.5" /> Posts</TabsTrigger>
              <TabsTrigger value="marketplace" className="rounded-lg text-xs gap-1"><ShoppingBag className="h-3.5 w-3.5" /> Marketplace</TabsTrigger>
              <TabsTrigger value="confessions" className="rounded-lg text-xs gap-1"><Ghost className="h-3.5 w-3.5" /> Confessions</TabsTrigger>
              <TabsTrigger value="events" className="rounded-lg text-xs gap-1"><Calendar className="h-3.5 w-3.5" /> Events</TabsTrigger>
              <TabsTrigger value="communities" className="rounded-lg text-xs gap-1"><UsersIcon className="h-3.5 w-3.5" /> Communities</TabsTrigger>
              <TabsTrigger value="notes" className="rounded-lg text-xs gap-1"><FileText className="h-3.5 w-3.5" /> Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="users"><UsersTab /></TabsContent>
            <TabsContent value="subjects"><SubjectsTab /></TabsContent>
            <TabsContent value="posts"><PostsTab /></TabsContent>
            <TabsContent value="marketplace"><MarketplaceTab /></TabsContent>
            <TabsContent value="confessions"><ConfessionsTab /></TabsContent>
            <TabsContent value="events"><EventsTab /></TabsContent>
            <TabsContent value="communities"><CommunitiesTab /></TabsContent>
            <TabsContent value="notes"><NotesTab /></TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </AppLayout>
  );
}
