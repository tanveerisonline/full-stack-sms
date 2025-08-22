import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout/Layout";
import { useToast } from "@/components/Common/Toast";

// Auth Pages
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";
import ForgotPassword from "@/pages/auth/forgot-password";

// Main Pages
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import StudentRegistration from "@/pages/student-management/registration";
import StudentProfiles from "@/pages/student-management/profiles";
import IdCards from "@/pages/student-management/id-cards";
import Curriculum from "@/pages/academic/curriculum";
import Scheduling from "@/pages/academic/scheduling";
import Assignments from "@/pages/academic/assignments";
import Attendance from "@/pages/attendance";
import Grading from "@/pages/grading";
import Communication from "@/pages/communication";
import Financial from "@/pages/financial";
import Library from "@/pages/library";
import HR from "@/pages/hr";
import Facilities from "@/pages/facilities";
import Transportation from "@/pages/transportation";
import Hostel from "@/pages/hostel";
import Examinations from "@/pages/examinations";
import Reports from "@/pages/reports";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";

function AuthenticatedRoutes() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/profile" component={Profile} />
        <Route path="/settings" component={Settings} />
        <Route path="/students" component={StudentRegistration} />
        <Route path="/students/profiles" component={StudentProfiles} />
        <Route path="/students/id-cards" component={IdCards} />
        <Route path="/academic/curriculum" component={Curriculum} />
        <Route path="/academic/scheduling" component={Scheduling} />
        <Route path="/academic/assignments" component={Assignments} />
        <Route path="/attendance" component={Attendance} />
        <Route path="/grading" component={Grading} />
        <Route path="/communication" component={Communication} />
        <Route path="/financial" component={Financial} />
        <Route path="/library" component={Library} />
        <Route path="/hr" component={HR} />
        <Route path="/facilities" component={Facilities} />
        <Route path="/transportation" component={Transportation} />
        <Route path="/hostel" component={Hostel} />
        <Route path="/examinations" component={Examinations} />
        <Route path="/reports" component={Reports} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function UnauthenticatedRoutes() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route>
        <Redirect to="/login" />
      </Route>
    </Switch>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-graduation-cap text-white text-sm"></i>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">EduManage Pro</h1>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <AuthenticatedRoutes /> : <UnauthenticatedRoutes />;
}

function App() {
  const { ToastContainer } = useToast();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <ToastContainer />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
