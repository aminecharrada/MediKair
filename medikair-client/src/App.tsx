import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/Login";
import CataloguePage from "./pages/Catalogue";
import ProductDetailPage from "./pages/ProductDetail";
import CartPage from "./pages/Cart";
import DashboardPage from "./pages/Dashboard";
import CheckoutPage from "./pages/Checkout";
import ComparatorPage from "./pages/Comparator";
import ProfilePage from "./pages/Profile";
import OrdersPage from "./pages/Orders";
import NotificationsPage from "./pages/Notifications";
import ImportCSVPage from "./pages/ImportCSV";
import ChatBot from "./components/ChatBot";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/catalogue" element={<CataloguePage />} />
              <Route path="/produit/:id" element={<ProductDetailPage />} />
              <Route path="/panier" element={<CartPage />} />
              <Route path="/comparateur" element={<ComparatorPage />} />
              {/* Protected routes */}
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/profil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/commandes" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/import-csv" element={<ProtectedRoute><ImportCSVPage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ChatBot />
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
