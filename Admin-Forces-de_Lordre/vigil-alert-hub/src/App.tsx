import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Login from "./pages/Login";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Signalements from "./pages/Signalements";
import CasGraves from "./pages/CasGraves";
import Utilisateurs from "./pages/Utilisateurs";
import Feedbacks from "./pages/Feedbacks";
import Historique from "./pages/Historique";
import { PoliceLayout } from "@/components/police/PoliceLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              {/* Route publique de connexion */}
              <Route path="/login" element={<Login />} />
              
              {/* Routes protégées */}
              <Route path="/" element={
                <ProtectedRoute>
                  <PoliceLayout>
                    <Index />
                  </PoliceLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/historique" element={
                <ProtectedRoute>
                  <PoliceLayout>
                    <Historique />
                  </PoliceLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/signalements" element={
                <ProtectedRoute>
                  <PoliceLayout>
                    <Signalements />
                  </PoliceLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/cas-graves" element={
                <ProtectedRoute>
                  <PoliceLayout>
                    <CasGraves />
                  </PoliceLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/utilisateurs" element={
                <ProtectedRoute>
                  <PoliceLayout>
                    <Utilisateurs />
                  </PoliceLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/feedbacks" element={
                <ProtectedRoute>
                  <PoliceLayout>
                    <Feedbacks />
                  </PoliceLayout>
                </ProtectedRoute>
              } />
              
              {/* Route 404 protégée */}
              <Route path="*" element={
                <ProtectedRoute>
                  <PoliceLayout>
                    <NotFound />
                  </PoliceLayout>
                </ProtectedRoute>
              } />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
