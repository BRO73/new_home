import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import NotFound from "./pages/NotFound";
import MenuPage from "./pages/MenuPage";
import BookingPage from "./pages/BookingPage";
import Homepage from "./pages/Homepage";
import QRScannerPage from "./pages/QRScannerPage";
// import MenuOrderPage from "./pages/MenuOrderPage";
import FirebaseOTPLogin from "./pages/FirebaseOtpLogin";
import LiveOrderPage from "./pages/LiveOrderPage";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import ThankYouPage from './pages/ThankYouPage';
import MinigamePage from './pages/MinigamePage';
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route element={<Layout />}>
              <Route path="/" element={<Homepage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/booking" element={<BookingPage />} />
            </Route>
            <Route path="/qr-scanner" element={<QRScannerPage />} />
            <Route path="/otp-login" element={<FirebaseOTPLogin />} />
            <Route path="/thank-you" element={<ThankYouPage />} />
            <Route path="/minigame" element={<MinigamePage />} />
            {/* Private routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/live-order" element={<LiveOrderPage />} />
              <Route path="/payment-success" element={<PaymentSuccessPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
