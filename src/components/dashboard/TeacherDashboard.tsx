import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, LogOut, Users, FileText } from "lucide-react";
import ViewAttendanceSection from "./teacher/ViewAttendanceSection";
import ViewAssignmentsSection from "./teacher/ViewAssignmentsSection";

interface TeacherDashboardProps {
  profile: any;
}

const TeacherDashboard = ({ profile }: TeacherDashboardProps) => {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("attendance");

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-primary text-primary-foreground shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Teacher Dashboard</h1>
                <p className="text-sm opacity-90">Welcome, {profile.full_name}</p>
              </div>
            </div>
            <Button variant="ghost" onClick={signOut} className="text-primary-foreground hover:bg-white/20">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
            <TabsTrigger value="attendance" className="gap-2">
              <Users className="w-4 h-4" />
              Student Attendance
            </TabsTrigger>
            <TabsTrigger value="assignments" className="gap-2">
              <FileText className="w-4 h-4" />
              Submitted Assignments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance">
            <ViewAttendanceSection />
          </TabsContent>

          <TabsContent value="assignments">
            <ViewAssignmentsSection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TeacherDashboard;
