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
import { Plus, Search, MessageCircle, Tag, Package, BookOpen, Monitor, Armchair, Calculator, Filter } from "lucide-react";

const CATEGORIES = [
  { value: "textbooks", label: "Textbooks", icon: BookOpen },
  { value: "electronics", label: "Electronics", icon: Monitor },
  { value: "furniture", label: "Furniture", icon: Armchair },
  { value: "calculators", label: "Calculators", icon: Calculator },
  { value: "other", label: "Other", icon: Package },
];

function getCategoryIcon(cat: string) {
  const found = CATEGORIES.find((c) => c.value === cat);
  return found ? found.icon : Package;
}

export default function Marketplace() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("textbooks");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["marketplace", filterCategory, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("marketplace_listings")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (filterCategory !== "all") {
        query = query.eq("category", filterCategory);
      }
      if (searchQuery.trim()) {
        query = query.ilike("title", `%${searchQuery.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch seller profiles
      const userIds = [...new Set((data || []).map((l: any) => l.user_id))];
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = Object.fromEntries((profiles || []).map((p: any) => [p.user_id, p]));

      return (data || []).map((l: any) => ({ ...l, seller: profileMap[l.user_id] || null }));
    },
  });

  const createListing = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      let image_url: string | null = null;

      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("marketplace").upload(path, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("marketplace").getPublicUrl(path);
        image_url = urlData.publicUrl;
      }

      const { error } = await supabase.from("marketplace_listings").insert({
        user_id: user.id,
        title,
        description,
        price: parseFloat(price) || 0,
        category,
        image_url,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace"] });
      toast.success("Listing created!");
      setDialogOpen(false);
      setTitle("");
      setDescription("");
      setPrice("");
      setCategory("textbooks");
      setImageFile(null);
    },
    onError: () => toast.error("Failed to create listing"),
  });

  const formatPrice = (p: number) => `Rs. ${p.toLocaleString()}`;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <Tag className="h-6 w-6 text-primary" />
              MarketPlace
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Buy & sell within the campus community</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl gap-2">
                <Plus className="h-4 w-4" /> Sell Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">Create Listing</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <Input placeholder="Item title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <Textarea placeholder="Describe your item..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                <div className="flex gap-3">
                  <Input placeholder="Price (Rs.)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="flex-1" />
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1.5">Item Photo</label>
                  <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                </div>
                <Button
                  className="w-full rounded-xl"
                  disabled={!title.trim() || !price || createListing.isPending}
                  onClick={() => createListing.mutate()}
                >
                  {createListing.isPending ? "Posting..." : "Post Listing"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <Button
              variant={filterCategory === "all" ? "default" : "outline"}
              size="sm"
              className="rounded-full text-xs"
              onClick={() => setFilterCategory("all")}
            >
              All
            </Button>
            {CATEGORIES.map((c) => (
              <Button
                key={c.value}
                variant={filterCategory === c.value ? "default" : "outline"}
                size="sm"
                className="rounded-full text-xs gap-1"
                onClick={() => setFilterCategory(c.value)}
              >
                <c.icon className="h-3 w-3" />
                {c.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-surface animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No listings yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Be the first to sell something!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence>
              {listings.map((listing: any, idx: number) => {
                const CatIcon = getCategoryIcon(listing.category);
                return (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="overflow-hidden rounded-2xl border-border/40 hover:shadow-lg transition-shadow duration-300">
                      {/* Image */}
                      {listing.image_url ? (
                        <div className="h-44 overflow-hidden bg-surface">
                          <img
                            src={listing.image_url}
                            alt={listing.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="h-44 bg-surface flex items-center justify-center">
                          <CatIcon className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}

                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-foreground truncate">{listing.title}</h3>
                            {listing.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{listing.description}</p>
                            )}
                          </div>
                          <Badge variant="secondary" className="shrink-0 text-xs gap-1 rounded-full">
                            <CatIcon className="h-3 w-3" />
                            {CATEGORIES.find((c) => c.value === listing.category)?.label || "Other"}
                          </Badge>
                        </div>

                        <p className="text-lg font-bold text-primary">{formatPrice(listing.price)}</p>

                        <div className="flex items-center justify-between pt-1 border-t border-border/30">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={listing.seller?.avatar_url || undefined} />
                              <AvatarFallback className="text-[10px] bg-surface text-primary font-bold">
                                {(listing.seller?.display_name || "U").slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                              {listing.seller?.display_name || listing.seller?.username || "Unknown"}
                            </span>
                          </div>
                          <Button variant="ghost" size="sm" className="rounded-full text-xs gap-1 text-primary hover:bg-primary/10">
                            <MessageCircle className="h-3.5 w-3.5" /> Chat
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
