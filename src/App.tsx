import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import Feed from "./pages/Feed";
import CreatePost from "./pages/CreatePost";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Discover from "./pages/Discover";
import HowToUse from "./pages/HowToUse";
import Notifications from "./pages/Notifications";
import ConfessionWall from "./pages/ConfessionWall";
import Marketplace from "./pages/Marketplace";
import StudyPartner from "./pages/StudyPartner";
import NotesResources from "./pages/NotesResources";
import AdminDashboard from "./pages/AdminDashboard";
import AIAssistant from "./pages/AIAssistant";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    if (!user) { setCheckingOnboarding(false); return; }
    supabase.from("profiles").select("onboarding_completed").eq("user_id", user.id).single()
      .then(({ data }) => {
        setOnboardingDone(!!data?.onboarding_completed);
        setCheckingOnboarding(false);
      });
  }, [user]);

  if (loading || checkingOnboarding) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!onboardingDone) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/feed" replace /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/feed" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/feed" replace /> : <Register />} />
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route path="/feed" element={<OnboardingGuard><Feed /></OnboardingGuard>} />
      <Route path="/create" element={<OnboardingGuard><CreatePost /></OnboardingGuard>} />
      <Route path="/profile" element={<OnboardingGuard><Profile /></OnboardingGuard>} />
      <Route path="/discover" element={<OnboardingGuard><Discover /></OnboardingGuard>} />
      <Route path="/how-to-use" element={<OnboardingGuard><HowToUse /></OnboardingGuard>} />
      <Route path="/notifications" element={<OnboardingGuard><Notifications /></OnboardingGuard>} />
      <Route path="/confessions" element={<OnboardingGuard><ConfessionWall /></OnboardingGuard>} />
      <Route path="/marketplace" element={<OnboardingGuard><Marketplace /></OnboardingGuard>} />
      <Route path="/study-partner" element={<OnboardingGuard><StudyPartner /></OnboardingGuard>} />
      <Route path="/notes" element={<OnboardingGuard><NotesResources /></OnboardingGuard>} />
      <Route path="/admin" element={<OnboardingGuard><AdminDashboard /></OnboardingGuard>} />
      <Route path="/user/:username" element={<OnboardingGuard><UserProfile /></OnboardingGuard>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <NotificationsProvider>
              <AppRoutes />
            </NotificationsProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
