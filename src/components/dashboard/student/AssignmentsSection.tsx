import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FileText, Upload, Calendar, Download } from "lucide-react";
import { format } from "date-fns";

const AssignmentsSection = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    comments: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const { data: assignments, isLoading } = useQuery({
    queryKey: ["assignments", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("user_id", user!.id)
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user!.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("assignments")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("assignments")
        .getPublicUrl(fileName);

      // Insert assignment record
      const { error: insertError } = await supabase.from("assignments").insert({
        user_id: user!.id,
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        comments: formData.comments,
        file_url: publicUrl,
        file_name: file.name,
        file_type: file.type,
      });

      if (insertError) throw insertError;

      toast.success("Assignment submitted successfully!");
      setFormData({ title: "", description: "", subject: "", comments: "" });
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ["assignments", user?.id] });
    } catch (error: any) {
      toast.error(error.message || "Failed to submit assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Submit Assignment
          </CardTitle>
          <CardDescription>Upload your assignment documents and files</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Math Homework Chapter 5"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Mathematics"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the assignment..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comments">Comments (Optional)</Label>
              <Textarea
                id="comments"
                placeholder="Any additional comments or notes..."
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Upload File (PDF, Word, Image)</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Submitting..." : "Submit Assignment"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submitted Assignments</CardTitle>
          <CardDescription>Your assignment submission history</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : assignments && assignments.length > 0 ? (
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{assignment.title}</h4>
                        {assignment.subject && (
                          <p className="text-sm text-muted-foreground">{assignment.subject}</p>
                        )}
                        {assignment.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {assignment.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Submitted: {format(new Date(assignment.submitted_at), "MMM dd, yyyy HH:mm")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(assignment.file_url, "_blank")}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No assignments submitted yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentsSection;
