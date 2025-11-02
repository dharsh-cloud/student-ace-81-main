import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, Calendar as CalendarIcon, FileCheck } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from "date-fns";

const PerformanceSection = () => {
  const { user } = useAuth();

  const { data: attendanceData } = useQuery({
    queryKey: ["attendance", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("user_id", user!.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: assignmentsData } = useQuery({
    queryKey: ["assignments", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("user_id", user!.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: notesData } = useQuery({
    queryKey: ["study_notes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_notes")
        .select("*")
        .eq("user_id", user!.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Calculate current month stats
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const currentMonthAttendance = attendanceData?.filter((record) =>
    isWithinInterval(new Date(record.date), { start: monthStart, end: monthEnd })
  ).length || 0;

  const attendancePercentage = ((currentMonthAttendance / daysInMonth.length) * 100).toFixed(1);

  const currentMonthAssignments = assignmentsData?.filter((assignment) =>
    isWithinInterval(new Date(assignment.submitted_at), { start: monthStart, end: monthEnd })
  ).length || 0;

  const completedNotes = notesData?.filter((note) => note.is_completed).length || 0;
  const totalNotes = notesData?.length || 0;
  const notesCompletionRate = totalNotes > 0 ? ((completedNotes / totalNotes) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Performance Overview
          </CardTitle>
          <CardDescription>
            Your academic performance for {format(now, "MMMM yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <CalendarIcon className="w-5 h-5 text-success" />
                  </div>
                  <span className="text-2xl font-bold text-success">{currentMonthAttendance}</span>
                </div>
                <p className="text-sm font-medium">Days Present</p>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileCheck className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-2xl font-bold text-primary">{currentMonthAssignments}</span>
                </div>
                <p className="text-sm font-medium">Assignments Submitted</p>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-secondary" />
                  </div>
                  <span className="text-2xl font-bold text-secondary">
                    {completedNotes}/{totalNotes}
                  </span>
                </div>
                <p className="text-sm font-medium">Notes Completed</p>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Attendance Rate</p>
                <p className="text-sm text-muted-foreground">{attendancePercentage}%</p>
              </div>
              <Progress value={parseFloat(attendancePercentage)} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Notes Completion</p>
                <p className="text-sm text-muted-foreground">{notesCompletionRate}%</p>
              </div>
              <Progress value={parseFloat(notesCompletionRate.toString())} className="h-2" />
            </div>
          </div>

          <div className="p-4 bg-gradient-card rounded-lg border">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              Quick Summary
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                • You've attended {currentMonthAttendance} out of {daysInMonth.length} days this
                month
              </li>
              <li>• You've submitted {currentMonthAssignments} assignments this month</li>
              <li>
                • You have {totalNotes - completedNotes} pending notes to complete
              </li>
              <li>• Total assignments submitted: {assignmentsData?.length || 0}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceSection;
