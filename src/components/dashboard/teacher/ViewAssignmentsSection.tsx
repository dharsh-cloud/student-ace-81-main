import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, Calendar } from "lucide-react";
import { format } from "date-fns";

const ViewAssignmentsSection = () => {
  const { data: assignmentsData, isLoading } = useQuery({
    queryKey: ["all_assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select(`
          *,
          profiles (
            full_name,
            roll_number
          )
        `)
        .order("submitted_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Submitted Assignments
          </CardTitle>
          <CardDescription>View all student assignment submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading assignments...</p>
          ) : assignmentsData && assignmentsData.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Submitted On</TableHead>
                    <TableHead>File</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignmentsData.map((assignment: any) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        {assignment.profiles?.full_name || "Unknown"}
                      </TableCell>
                      <TableCell>{assignment.profiles?.roll_number || "N/A"}</TableCell>
                      <TableCell>{assignment.title}</TableCell>
                      <TableCell>{assignment.subject || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {format(new Date(assignment.submitted_at), "MMM dd, yyyy HH:mm")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(assignment.file_url, "_blank")}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No assignments submitted yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewAssignmentsSection;
