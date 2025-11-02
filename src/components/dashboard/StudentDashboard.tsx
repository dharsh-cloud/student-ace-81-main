import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, LogOut, ClipboardCheck, FileText, BookOpen, BarChart3 } from "lucide-react";
import AttendanceSection from "./student/AttendanceSection";
import AssignmentsSection from "./student/AssignmentsSection";
import NotesSection from "./student/NotesSection";
import PerformanceSection from "./student/PerformanceSection";

interface StudentDashboardProps {
  profile: any;
}

const StudentDashboard = ({ profile }: StudentDashboardProps) => {
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
                <h1 className="text-xl font-bold">Student Productivity Hub</h1>
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
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="attendance" className="gap-2">
              <ClipboardCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="assignments" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Assignments</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Study Notes</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance">
            <AttendanceSection />
          </TabsContent>

          <TabsContent value="assignments">
            <AssignmentsSection />
          </TabsContent>

          <TabsContent value="notes">
            <NotesSection />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceSection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StudentDashboard;
