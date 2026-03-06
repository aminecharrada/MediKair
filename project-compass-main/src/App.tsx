import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/Login";
import CataloguePage from "./pages/Catalogue";
import ProductDetailPage from "./pages/ProductDetail";
import CartPage from "./pages/Cart";
import DashboardPage from "./pages/Dashboard";
import CheckoutPage from "./pages/Checkout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminClients from "./pages/AdminClients";
import AdminOrders from "./pages/AdminOrders";
import AdminSettings from "./pages/AdminSettings";
import AdminPromotions from "./pages/AdminPromotions";
import AdminReports from "./pages/AdminReports";
import ComparatorPage from "./pages/Comparator";
import ProfilePage from "./pages/Profile";
import OrdersPage from "./pages/Orders";
import NotificationsPage from "./pages/Notifications";
import ChatBot from "./components/ChatBot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profil" element={<ProfilePage />} />
          <Route path="/commandes" element={<OrdersPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/comparateur" element={<ComparatorPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/produits" element={<AdminProducts />} />
          <Route path="/admin/clients" element={<AdminClients />} />
          <Route path="/admin/commandes" element={<AdminOrders />} />
          <Route path="/admin/parametres" element={<AdminSettings />} />
          <Route path="/admin/promotions" element={<AdminPromotions />} />
          <Route path="/admin/rapports" element={<AdminReports />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ChatBot />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
