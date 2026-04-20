import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AuthGuard } from "@/components/AuthGuard";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Diagnostico from "./pages/Diagnostico";
import Dividas from "./pages/Dividas";
import NovaDivida from "./pages/NovaDivida";
import PlanoDeAcao from "./pages/PlanoDeAcao";
import Casos from "./pages/Casos";
import Perfil from "./pages/Perfil";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" attribute="class">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<AuthGuard><Onboarding /></AuthGuard>} />
            <Route element={<AuthGuard><DashboardLayout /></AuthGuard>}>
              <Route path="/diagnostico" element={<Diagnostico />} />
              <Route path="/dividas" element={<Dividas />} />
              <Route path="/dividas/nova" element={<NovaDivida />} />
              <Route path="/dividas/:debtId/acao" element={<PlanoDeAcao />} />
              <Route path="/casos" element={<Casos />} />
              <Route path="/perfil" element={<Perfil />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
