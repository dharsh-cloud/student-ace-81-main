import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GraduationCap,
  CheckCircle,
  FileText,
  BookOpen,
  BarChart3,
  MapPin,
  Bell,
  TrendingUp,
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const features = [
    {
      icon: CheckCircle,
      title: "Smart Attendance",
      description: "Mark your attendance with GPS verification. Never miss a day!",
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      icon: FileText,
      title: "Assignment Management",
      description: "Submit assignments with ease. Upload documents, images, and more.",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: BookOpen,
      title: "Study Notes",
      description: "Keep your notes organized with reminders and task tracking.",
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Track your progress with detailed performance reports.",
      color: "text-accent",
      bg: "bg-accent/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <GraduationCap className="w-12 h-12 text-primary-foreground" />
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Student Productivity Hub
          </h1>
          
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
            Your all-in-one platform for academic excellence. Track attendance, submit assignments, manage notes, and monitor your performance.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-white text-primary hover:bg-white/90 shadow-xl text-lg px-8 py-6"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/auth")}
              className="bg-white/10 text-primary-foreground border-primary-foreground/30 hover:bg-white/20 backdrop-blur-sm text-lg px-8 py-6"
            >
              Sign In
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap gap-8 justify-center text-primary-foreground/80 animate-in fade-in duration-700 delay-500">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>GPS Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <span>Smart Reminders</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span>Progress Analytics</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help students and teachers stay organized and productive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-10" />
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Boost Your Productivity?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of students already using our platform to achieve academic success.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="bg-white text-primary hover:bg-white/90 shadow-xl text-lg px-12 py-6"
          >
            Start Your Journey
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-6 h-6 text-primary" />
            <p className="font-semibold text-lg">Student Productivity Hub</p>
          </div>
          <p className="text-muted-foreground">
            Empowering students to achieve their academic goals
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
