import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Printer, Calendar } from "lucide-react";
import { format } from "date-fns";

const ViewAttendanceSection = () => {
  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ["all_attendance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select(`
          *,
          profiles (
            full_name,
            roll_number
          )
        `)
        .order("date", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Student Attendance Records
              </CardTitle>
              <CardDescription>View and print student attendance records</CardDescription>
            </div>
            <Button onClick={handlePrint} variant="outline" className="print:hidden">
              <Printer className="w-4 h-4 mr-2" />
              Print Attendance
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading attendance data...</p>
          ) : attendanceData && attendanceData.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="print:hidden">Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceData.map((record: any) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {format(new Date(record.date), "MMM dd, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>{record.profiles?.full_name || "Unknown"}</TableCell>
                      <TableCell>{record.profiles?.roll_number || "N/A"}</TableCell>
                      <TableCell>{record.time}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                          {record.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground print:hidden">
                        {record.location_name || "Not provided"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No attendance records available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewAttendanceSection;
