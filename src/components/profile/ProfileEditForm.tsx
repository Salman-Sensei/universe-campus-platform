import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

interface ProfileEditFormProps {
  form: {
    display_name: string;
    bio: string;
    favorite_music: string;
    quote: string;
    interests: string;
    semester?: string;
    batch?: string;
  };
  setForm: (form: ProfileEditFormProps["form"]) => void;
}

const textFields = [
  { key: "display_name", label: "Display Name", placeholder: "Your display name" },
  { key: "favorite_music", label: "Favorite Music", placeholder: "e.g. Lo-fi, Indie Rock" },
  { key: "quote", label: "Favorite Quote", placeholder: "Your favorite quote" },
  { key: "interests", label: "Interests (comma separated)", placeholder: "coding, music, space" },
  { key: "batch", label: "Batch", placeholder: "e.g. 2023" },
];

export function ProfileEditForm({ form, setForm }: ProfileEditFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-3 overflow-hidden"
    >
      {textFields.map((field) => (
        <div key={field.key} className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{field.label}</Label>
          <Input
            value={(form as any)[field.key] || ""}
            onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
            className="bg-surface/40 border-border/30 rounded-xl h-10 focus:ring-1 focus:ring-primary/30"
            placeholder={field.placeholder}
          />
        </div>
      ))}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Semester</Label>
        <Select value={form.semester || ""} onValueChange={(v) => setForm({ ...form, semester: v })}>
          <SelectTrigger className="bg-surface/40 border-border/30 rounded-xl h-10">
            <SelectValue placeholder="Select semester" />
          </SelectTrigger>
          <SelectContent>
            {["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"].map((s) => (
              <SelectItem key={s} value={s}>{s} Semester</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Bio</Label>
        <Textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          className="bg-surface/40 border-border/30 resize-none rounded-xl focus:ring-1 focus:ring-primary/30"
          rows={3}
          placeholder="Tell us about yourself..."
        />
      </div>
    </motion.div>
  );
}
