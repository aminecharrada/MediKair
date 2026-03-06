import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthContext";
import AdminLoginPage from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminClients from "./pages/AdminClients";
import AdminOrders from "./pages/AdminOrders";
import AdminSettings from "./pages/AdminSettings";
import AdminPromotions from "./pages/AdminPromotions";
import AdminReports from "./pages/AdminReports";
import AdminCategories from "./pages/AdminCategories";
import AdminHeroImages from "./pages/AdminHeroImages";
import AdminUsers from "./pages/AdminUsers";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLoginPage />} />
      <Route path="/" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/produits" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
      <Route path="/clients" element={<ProtectedRoute><AdminClients /></ProtectedRoute>} />
      <Route path="/commandes" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
      <Route path="/parametres" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
      <Route path="/promotions" element={<ProtectedRoute><AdminPromotions /></ProtectedRoute>} />
      <Route path="/rapports" element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />
      <Route path="/categories" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />
      <Route path="/hero-images" element={<ProtectedRoute><AdminHeroImages /></ProtectedRoute>} />
      <Route path="/admins" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AdminAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AdminAuthProvider>
  </QueryClientProvider>
);

export default App;
