import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MapPin, Calendar, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";

const AttendanceSection = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationName, setLocationName] = useState<string>("");

  const { data: attendanceRecords, isLoading } = useQuery({
    queryKey: ["attendance", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("user_id", user!.id)
        .order("date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const markAttendance = useMutation({
    mutationFn: async () => {
      if (!location) {
        throw new Error("Location not available");
      }

      const { error } = await supabase.from("attendance").insert({
        user_id: user!.id,
        latitude: location.latitude,
        longitude: location.longitude,
        location_name: locationName || "Unknown location",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance", user?.id] });
      toast.success("Attendance marked successfully!");
      setLocation(null);
      setLocationName("");
    },
    onError: (error: any) => {
      if (error.message.includes("duplicate")) {
        toast.error("You've already marked attendance for today!");
      } else {
        toast.error(error.message || "Failed to mark attendance");
      }
    },
  });

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(loc);
        setLocationName(`${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}`);
        toast.success("Location captured!");
      },
      (error) => {
        toast.error("Unable to retrieve location. Please enable location services.");
      }
    );
  };

  const todayAttendance = attendanceRecords?.find(
    (record) => record.date === format(new Date(), "yyyy-MM-dd")
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            Mark Today's Attendance
          </CardTitle>
          <CardDescription>
            Mark your attendance with GPS location verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {todayAttendance ? (
            <div className="p-4 bg-success/10 rounded-lg border border-success/20">
              <p className="text-success font-medium flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Attendance already marked for today!
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Marked at: {todayAttendance.time}
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={getLocation} variant="outline" className="flex-1">
                  <MapPin className="w-4 h-4 mr-2" />
                  Get Current Location
                </Button>
                <Button
                  onClick={() => markAttendance.mutate()}
                  disabled={!location || markAttendance.isPending}
                  className="flex-1"
                >
                  {markAttendance.isPending ? "Marking..." : "Mark Attendance"}
                </Button>
              </div>
              {location && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Location captured:</p>
                  <p className="text-sm text-muted-foreground">{locationName}</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>Your recent attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : attendanceRecords && attendanceRecords.length > 0 ? (
            <div className="space-y-3">
              {attendanceRecords.slice(0, 10).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(record.date), "MMMM dd, yyyy")}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {record.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-success">{record.status}</p>
                    {record.location_name && (
                      <p className="text-xs text-muted-foreground">{record.location_name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No attendance records yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceSection;
