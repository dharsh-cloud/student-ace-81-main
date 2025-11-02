import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { BookOpen, Plus, Calendar, Bell, Trash2, Check } from "lucide-react";
import { format } from "date-fns";

const NotesSection = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    subject: "",
    reminder_date: "",
  });

  const { data: notes, isLoading } = useQuery({
    queryKey: ["study_notes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_notes")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addNote = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("study_notes").insert({
        user_id: user!.id,
        title: formData.title,
        content: formData.content,
        subject: formData.subject,
        reminder_date: formData.reminder_date || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study_notes", user?.id] });
      toast.success("Note added successfully!");
      setFormData({ title: "", content: "", subject: "", reminder_date: "" });
      setIsAdding(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add note");
    },
  });

  const toggleComplete = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from("study_notes")
        .update({ is_completed: !completed })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study_notes", user?.id] });
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("study_notes").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study_notes", user?.id] });
      toast.success("Note deleted successfully!");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addNote.mutate();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Study Notes & Reminders
              </CardTitle>
              <CardDescription>Keep track of your daily study notes and tasks</CardDescription>
            </div>
            <Button onClick={() => setIsAdding(!isAdding)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              {isAdding ? "Cancel" : "Add Note"}
            </Button>
          </div>
        </CardHeader>
        {isAdding && (
          <CardContent className="border-t">
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="note-title">Title</Label>
                  <Input
                    id="note-title"
                    placeholder="e.g., Chapter 5 Summary"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note-subject">Subject</Label>
                  <Input
                    id="note-subject"
                    placeholder="e.g., Physics"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="note-content">Content</Label>
                <Textarea
                  id="note-content"
                  placeholder="Write your notes here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminder">Set Reminder (Optional)</Label>
                <Input
                  id="reminder"
                  type="datetime-local"
                  value={formData.reminder_date}
                  onChange={(e) => setFormData({ ...formData, reminder_date: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={addNote.isPending}>
                {addNote.isPending ? "Adding..." : "Save Note"}
              </Button>
            </form>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Notes</CardTitle>
          <CardDescription>All your study notes and reminders</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : notes && notes.length > 0 ? (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                    note.is_completed ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={note.is_completed}
                      onCheckedChange={() =>
                        toggleComplete.mutate({ id: note.id, completed: note.is_completed })
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4
                            className={`font-medium ${
                              note.is_completed ? "line-through" : ""
                            }`}
                          >
                            {note.title}
                          </h4>
                          {note.subject && (
                            <p className="text-sm text-muted-foreground">{note.subject}</p>
                          )}
                          <p className="text-sm mt-2 whitespace-pre-wrap">{note.content}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(note.created_at), "MMM dd, yyyy")}
                            </span>
                            {note.reminder_date && (
                              <span className="flex items-center gap-1 text-warning">
                                <Bell className="w-3 h-3" />
                                Reminder: {format(new Date(note.reminder_date), "MMM dd, HH:mm")}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNote.mutate(note.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No notes yet. Start adding some!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotesSection;
