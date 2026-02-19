import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AppShell } from "@/components/layout/AppShell";
import { BottomNav } from "@/components/layout/BottomNav";
import { lazy, Suspense } from "react";

const Index = lazy(() => import("./pages/Index"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const TrackOrderPage = lazy(() => import("./pages/TrackOrderPage"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const PoliciesPage = lazy(() => import("./pages/PoliciesPage"));
const InstallPage = lazy(() => import("./pages/InstallPage"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppShell>
            <Suspense fallback={<Loader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/track-order" element={<TrackOrderPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/policies" element={<PoliciesPage />} />
                <Route path="/install" element={<InstallPage />} />
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <BottomNav />
          </AppShell>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
