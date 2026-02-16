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
import UserProfile from "@/pages/profile/UserProfile";
import TeacherProfiles from "@/pages/hr/profiles";
import PayrollManagement from "@/pages/hr/payroll";
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
import Examinations from "@/pages/examinations";
import Admin from "@/pages/admin";
import SuperAdminDashboard from "@/pages/admin/SuperAdminDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import TeacherDashboard from "@/pages/dashboards/TeacherDashboard";
import StudentDashboard from "@/pages/dashboards/StudentDashboard";
import NotFound from "@/pages/not-found";

function AuthenticatedRoutes() {
  const { user } = useAuth();
  
  console.log('AuthenticatedRoutes: Current user:', user);
  console.log('AuthenticatedRoutes: User role:', user?.role);
  console.log('AuthenticatedRoutes: Is super_admin?', user?.role === 'super_admin');
  
  return (
    <Switch>
      {/* Super Admin Dashboard - render without Layout, only for super_admin role */}
      {user?.role === 'super_admin' && (
        <>
          <Route path="/" component={() => <Redirect to="/super-admin" />} />
          <Route path="/super-admin" component={SuperAdminDashboard} />
        </>
      )}
      
      {/* Role-based dashboard routes */}
      {user?.role === 'admin' && (
        <>
          <Route path="/" component={() => <Redirect to="/admin-dashboard" />} />
          <Route path="/admin-dashboard" component={AdminDashboard} />
        </>
      )}
      {user?.role === 'teacher' && (
        <>
          <Route path="/" component={() => <Redirect to="/teacher-dashboard" />} />
          <Route path="/teacher-dashboard" component={TeacherDashboard} />
        </>
      )}
      {user?.role === 'student' && (
        <>
          <Route path="/" component={() => <Redirect to="/student-dashboard" />} />
          <Route path="/student-dashboard" component={StudentDashboard} />
        </>
      )}
      
      {/* Regular app routes - render with Layout */}
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/profile" component={Profile} />
            <Route path="/user-profile" component={UserProfile} />
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
            <Route path="/hr/profiles" component={TeacherProfiles} />
            <Route path="/hr/payroll" component={PayrollManagement} />
            <Route path="/facilities" component={Facilities} />
            <Route path="/transportation" component={Transportation} />
            <Route path="/examinations" component={Examinations} />
            <Route path="/admin" component={Admin} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
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
