import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRScanner } from "@/components/QRScanner"; // Đảm bảo đường dẫn đúng
import { toast } from "sonner";

const QRScannerPage = () => {
  const navigate = useNavigate();
  const [scannedData, setScannedData] = useState<string>("");

  const handleScanSuccess = (decodedText: string) => {
    setScannedData(decodedText);
    console.log("Scanned QR Code:", decodedText);

    // Simulate extracting table number from QR code
    // In real scenario, parse the QR code data
    const tableNumber = "02"; // This would come from the QR code

    // Navigate to menu page with table number
    setTimeout(() => {
      navigate(`/menu?table=${tableNumber}`);
    }, 500);
  };

  const handleScanError = (error: string) => {
    console.error("Scan error:", error);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image with Blur */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80')",
          filter: "blur(8px)",
          transform: "scale(1.1)",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="p-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome to Flavor!
          </h2>
          <p className="text-white/90 text-sm">
            Scan or QR code on your table to start ordering.
            <br />
            Enjoy our restaurant!
          </p>
        </header>

        {/* Scanner */}
        <main className="flex-1 flex items-center justify-center px-6 pb-20">
          <QRScanner
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
          />
        </main>
      </div>
    </div>
  );
};

export default QRScannerPage;