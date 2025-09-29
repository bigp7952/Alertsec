import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ApiAuthProvider } from "@/contexts/ApiAuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import AuthWrapper from "@/components/auth/AuthWrapper";
import LoginForm from "@/components/auth/LoginForm";
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
        <ApiAuthProvider>
          <NotificationProvider>
            <Routes>
              {/* Route publique de connexion */}
              <Route path="/login" element={<LoginForm />} />
              
              {/* Routes protégées */}
              <Route path="/" element={
                <AuthWrapper>
                  <Index />
                </AuthWrapper>
              } />
              
              <Route path="/historique" element={
                <AuthWrapper>
                  <PoliceLayout>
                    <Historique />
                  </PoliceLayout>
                </AuthWrapper>
              } />
              
              <Route path="/signalements" element={
                <AuthWrapper>
                  <PoliceLayout>
                    <Signalements />
                  </PoliceLayout>
                </AuthWrapper>
              } />
              
              <Route path="/cas-graves" element={
                <AuthWrapper>
                  <PoliceLayout>
                    <CasGraves />
                  </PoliceLayout>
                </AuthWrapper>
              } />
              
              <Route path="/utilisateurs" element={
                <AuthWrapper>
                  <PoliceLayout>
                    <Utilisateurs />
                  </PoliceLayout>
                </AuthWrapper>
              } />
              
              <Route path="/feedbacks" element={
                <AuthWrapper>
                  <PoliceLayout>
                    <Feedbacks />
                  </PoliceLayout>
                </AuthWrapper>
              } />
              
              {/* Route 404 protégée */}
              <Route path="*" element={
                <AuthWrapper>
                  <NotFound />
                </AuthWrapper>
              } />
            </Routes>
          </NotificationProvider>
        </ApiAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
