import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Zap, ZapOff } from "lucide-react"; // Import ZapOff
import { toast } from "sonner";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

export const QRScanner = ({ onScanSuccess, onScanError }: QRScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [cameraId, setCameraId] = useState<string>("");

  // ... (toàn bộ phần useEffect và logic functions giữ nguyên) ...
  // ... (useEffect, toggleFlash, handleManualEntry) ...

  useEffect(() => {
    const initScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          const backCamera =
            devices.find(
              (device) =>
                device.label.toLowerCase().includes("back") ||
                device.label.toLowerCase().includes("rear")
            ) || devices[0];

          setCameraId(backCamera.id);

          const scanner = new Html5Qrcode("qr-reader");
          scannerRef.current = scanner;

          await scanner.start(
            backCamera.id,
            {
              fps: 10,
              aspectRatio: 1.0,
            },
            (decodedText) => {
              onScanSuccess(decodedText);
              toast.success("QR Code scanned successfully!");
              if (scannerRef.current && isScanning) {
                scannerRef.current.stop().catch(console.error);
                setIsScanning(false);
              }
            },
            (errorMessage) => {
              // Silent fail
            }
          );

          setIsScanning(true);

          const activeStream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: backCamera.id },
          });
          const track = activeStream.getVideoTracks()[0];
          const capabilities = track.getCapabilities();

          if ("torch" in capabilities) {
            setHasFlash(true);
          }
          // Không stop stream ở đây
        }
      } catch (error) {
        console.error("Error initializing scanner:", error);
        const errorMsg =
          "Unable to access camera. Please grant camera permissions.";
        toast.error(errorMsg);
        if (onScanError) onScanError(errorMsg);
      }
    };

    initScanner();

    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []); // Thêm isScanning vào dependency array để quản lý stop tốt hơn
  
  // toggleFlash và handleManualEntry giữ nguyên
  const toggleFlash = async () => {
    try {
      if (!cameraId) return;

      // Cần lấy stream lại để điều khiển đèn pin
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: cameraId }
      });
      const track = stream.getVideoTracks()[0];
      
      const newFlashState = !flashEnabled;
      await track.applyConstraints({
        advanced: [{ torch: newFlashState } as any]
      });
      
      setFlashEnabled(newFlashState);
      toast.success(newFlashState ? "Flash enabled" : "Flash disabled");
      
      // Dừng stream tạm thời này
      stream.getTracks().forEach(t => t.stop());

    } catch (error) {
      console.error("Error toggling flash:", error);
      toast.error("Unable to toggle flash");
    }
  };

  const handleManualEntry = () => {
    toast.info("Manual entry feature coming soon!");
  };


  return (
    <div className="relative w-full max-w-sm mx-auto">
      <style>{`
        /* SỬA LẠI KEYFRAMES Ở ĐÂY */
        @keyframes scan {
          0% { 
            top: 0; 
            opacity: 0; 
          }
          10%, 90% {
            opacity: 1;
          }
          100% { 
            top: 100%; 
            opacity: 0; 
          }
        }
        .scanning-line-animation {
          /* Dùng 'animation' thay vì 'animation-name' để gán đầy đủ thuộc tính */
          animation: scan 2.5s ease-in-out infinite;
        }
        
        /* OVERRIDE html5-qrcode DEFAULT STYLES (giữ nguyên) */
        #qr-reader {
          border: none !important;
          width: 100% !important;
          min-height: auto !important;
          aspect-ratio: 1 / 1;
          position: relative;
          overflow: hidden;
        }
        #qr-reader__scan_region {
          border: none !important;
        }
        #qr-reader__dashboard_section,
        #qr-reader__dashboard_section_csr {
          display: none !important;
        }
        #qr-reader video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
          transform: scaleX(-1);
          border-radius: 1.5rem !important;
        }
      `}</style>

      {/* Container chính cho khu vực quét */}
      <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-2xl">
        {/* Outer Pink Corner Brackets */}
        <div className="absolute inset-0 pointer-events-none z-20">
          <div className="absolute top-0 left-0 w-24 h-24 border-t-8 border-l-8 border-pink-500 rounded-tl-3xl" />
          <div className="absolute top-0 right-0 w-24 h-24 border-t-8 border-r-8 border-pink-500 rounded-tr-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 border-b-8 border-l-8 border-pink-500 rounded-bl-3xl" />
          <div className="absolute bottom-0 right-0 w-24 h-24 border-b-8 border-r-8 border-pink-500 rounded-br-3xl" />
        </div>

        {/* Camera Feed Container */}
        <div className="relative w-full h-full bg-gray-900 rounded-3xl overflow-hidden">
          <div id="qr-reader" className="w-full h-full" />

          {/* Scanning Line Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            {/* SỬA LẠI CHỖ NÀY */}
            <div className="relative w-full h-full overflow-hidden">
              <div className="scanning-line-animation absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent shadow-lg shadow-pink-500/50" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls (giữ nguyên) */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <Button
          onClick={handleManualEntry}
          className="rounded-full px-8 py-6 text-base font-medium bg-gray-700/90 hover:bg-gray-600/90 text-white shadow-lg"
        >
          Not Working?
        </Button>

        {hasFlash && (
          <Button
            onClick={toggleFlash}
            size="icon"
            className="w-16 h-16 rounded-full bg-white shadow-lg hover:bg-gray-50"
          >
            {flashEnabled ? (
              <Zap className="w-7 h-7 text-red-500 fill-red-500" />
            ) : (
              <ZapOff className="w-7 h-7 text-red-500" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};