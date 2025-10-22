import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import MenuPage from "./pages/MenuPage";
import BookingPage from "./pages/BookingPage";
import Homepage from "./pages/Homepage";
import Layout from "./components/Layout";
import QRScannerPage from "./pages/QRScannerPage";
import MenuOrderPage from "./pages/MenuOrderPage";
import CartItem from "./pages/CartItem";
import FirebaseOTPLogin from "./pages/FirebaseOtpLogin";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Homepage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/booking" element={<BookingPage />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="/qr-scanner" element={<QRScannerPage />} />
          <Route path="/menu-order" element={<MenuOrderPage />} />
          <Route path="/cart" element={<CartItem />} />
          <Route path="/otp-login" element={<FirebaseOTPLogin/>}/>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
