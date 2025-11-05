import { isAxiosError } from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import { initializeApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult, // Import type
} from "firebase/auth";
import api from "@/api/axiosInstance";
import { useAuth } from "@/hooks/useAuth"; // <-- IMPORT useAuth

// Define global interface if not already defined elsewhere
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | undefined; // Use correct type
    confirmationResult: ConfirmationResult | undefined; // Optional: Store confirmation result globally if needed
  }
}

// --- Firebase Config --- (Keep your config)
const firebaseConfig = {
  apiKey: "AIzaSyCkI-cejUKdK7AWEAHAcBDpO5UGGzigTGU",
  authDomain: "otp-sms-58177.firebaseapp.com",
  projectId: "otp-sms-58177",
  storageBucket: "otp-sms-58177.firebasestorage.app",
  messagingSenderId: "201395098559",
  appId: "1:201395098559:web:0dbb3407ad17051628c70a",
  measurementId: "G-Y0920K5QQ3",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = "vi"; // Set language code if needed

// --- Component ---
const FirebaseOtpLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get location for redirect state
  const { login } = useAuth(); // <-- GET login function from AuthContext

  // --- State ---
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "register">("phone");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  // Register state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(""); // Optional
  const [address, setAddress] = useState(""); // Optional
  // Ref to store Firebase confirmation result
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  // Ref for reCAPTCHA container
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  // --- Helper Functions ---
  const log = (msg: string) => setMessage(msg);

  const clearRecaptcha = () => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear(); // Clear the reCAPTCHA widget
      window.recaptchaVerifier = undefined; // Reset the global verifier
      // Ensure the container is empty for re-rendering
      if (recaptchaContainerRef.current) {
        recaptchaContainerRef.current.innerHTML = "";
      }
    }
  };

  const setupRecaptcha = () => {
    clearRecaptcha(); // Clear any existing verifier first
    if (recaptchaContainerRef.current) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        recaptchaContainerRef.current, // Use the ref
        {
          size: "normal", // or 'invisible' or 'compact'
          callback: () => {
            // reCAPTCHA solved, allow user to proceed (optional)
            // console.log("reCAPTCHA solved");
          },
          "expired-callback": () => {
            // Response expired, ask user to solve reCAPTCHA again.
            log("reCAPTCHA đã hết hạn, vui lòng thử lại.");
            clearRecaptcha(); // Clear and potentially re-render
            setupRecaptcha(); // Re-setup reCAPTCHA
          },
        }
      );
      window.recaptchaVerifier.render().catch((error) => {
        console.error("reCAPTCHA render failed:", error);
        log("Không thể hiển thị reCAPTCHA. Vui lòng tải lại trang.");
      });
    } else {
      console.error("reCAPTCHA container not found");
    }
  };

  // --- Effects ---
  useEffect(() => {
    // Setup reCAPTCHA only when the step is 'phone' and container is ready
    if (step === "phone" && recaptchaContainerRef.current) {
      setupRecaptcha();
    }

    // Cleanup function to clear reCAPTCHA when component unmounts or step changes
    return () => {
      clearRecaptcha();
    };
  }, [step]); // Re-run effect if step changes

  // --- Handlers ---

  // 📨 Gửi OTP
  const sendOtp = async () => {
    if (!phone) return log("Vui lòng nhập số điện thoại.");
    if (!window.recaptchaVerifier) return log("reCAPTCHA chưa sẵn sàng.");

    // Format phone number to E.164
    let e164 = phone.trim();
    if (e164.startsWith("0")) {
      e164 = "+84" + e164.substring(1);
    } else if (!e164.startsWith("+84")) {
      e164 = "+84" + e164;
    }

    setLoading(true);
    setMessage(""); // Clear previous messages
    log("Đang gửi OTP...");
    try {
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        e164,
        window.recaptchaVerifier
      );
      confirmationResultRef.current = confirmationResult;
      setStep("otp");
      log("Đã gửi OTP. Vui lòng kiểm tra tin nhắn SMS.");
      // No need to clear reCAPTCHA here, might need it for resend
    } catch (error: any) {
      console.error("Gửi OTP thất bại:", error);
      let errorMsg = "Gửi OTP thất bại. ";
      if (error.code === "auth/invalid-phone-number") {
        errorMsg += "Số điện thoại không hợp lệ.";
      } else if (error.code === "auth/too-many-requests") {
        errorMsg += "Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau.";
      } else {
        errorMsg += error.message || "Lỗi không xác định.";
      }
      log(errorMsg);
      // Reset reCAPTCHA for the user to try again
      clearRecaptcha();
      setupRecaptcha();
    } finally {
      setLoading(false);
    }
  };

  // ✅ Xác thực OTP
  const verifyOtp = async () => {
    const confirmationResult = confirmationResultRef.current;
    if (!confirmationResult)
      return log("Lỗi: Không tìm thấy kết quả xác nhận.");
    if (!otp || otp.length !== 6)
      return log("Vui lòng nhập mã OTP gồm 6 chữ số.");

    setLoading(true);
    setMessage("");
    log("Đang xác thực OTP...");
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      const idToken = await user.getIdToken(/* forceRefresh */ true); // Get fresh ID token

      log("Firebase xác thực thành công. Đang kiểm tra với máy chủ...");

      // Send Firebase ID token to your backend
      const resp = await api.post(
        // Ensure the endpoint matches your backend
        `/auth/verify-firebase?idToken=${encodeURIComponent(idToken)}`
      );

      const data: {
        accessToken?: string;
        registrationToken?: string; // For new users needing profile completion
        isNewUser?: boolean; // Alternative flag from backend
      } = resp.data;

      // Case 1: Existing user (Backend returns accessToken)
      if (data.accessToken && !data.registrationToken) {
        log("Đăng nhập thành công!");
        login(data.accessToken); // <-- UPDATE AUTH CONTEXT

        // Redirect logic
        const pendingTableId = localStorage.getItem("pendingTableId");
        const redirectPath = location.state?.from?.pathname || "/"; // Default to home
        const redirectSearch = location.state?.from?.search || "";

        if (pendingTableId && redirectPath === "/menu-order") {
          localStorage.removeItem("pendingTableId"); // Clean up
          navigate(`/menu-order?tableId=${pendingTableId}`, { replace: true });
        } else {
          navigate(redirectPath + redirectSearch, { replace: true }); // Redirect back or to default
        }
      }
      // Case 2: New user (Backend returns registrationToken or indicates new user)
      else if (data.registrationToken || data.isNewUser) {
        log("Xác thực thành công. Vui lòng hoàn tất hồ sơ.");
        // Store registration token if backend sends one, needed for register API
        if (data.registrationToken) {
          localStorage.setItem("registrationToken", data.registrationToken);
        }
        setStep("register");
      }
      // Case 3: Invalid response from backend
      else {
        throw new Error("Phản hồi không hợp lệ từ máy chủ.");
      }
    } catch (error: any) {
      console.error("Xác thực OTP thất bại:", error);
      let errorMsg = "Xác thực OTP thất bại: ";
      if (isAxiosError(error)) {
        errorMsg += error.response?.data?.message || error.message;
      } else if (error.code === "auth/invalid-verification-code") {
        errorMsg += "Mã OTP không đúng.";
      } else if (error.code === "auth/code-expired") {
        errorMsg += "Mã OTP đã hết hạn. Vui lòng gửi lại.";
        // Optionally reset to phone step
        // setStep('phone');
      } else {
        errorMsg += error.message || "Lỗi không xác định.";
      }
      log(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 👤 Đăng ký profile
  const registerProfile = async () => {
    if (!fullName.trim()) return log("Vui lòng nhập họ tên.");
    // Add other validation if needed (email format, etc.)

    setLoading(true);
    setMessage("");
    log("Đang đăng ký thông tin...");

    // Use registration token if your backend requires it
    const registrationToken = localStorage.getItem("registrationToken");
    // Ensure you have the phone number stored correctly if needed
    const registeredPhone = phone; // Assuming 'phone' state holds the number

    try {
      const payload = {
        phoneNumber: registeredPhone, // Send phone if backend needs it
        fullName: fullName.trim(),
        email: email.trim() || undefined, // Send undefined if empty, or handle in backend
        address: address.trim() || undefined,
      };

      // Include registration token in header if needed
      const headers = registrationToken
        ? { Authorization: `Bearer ${registrationToken}` }
        : {};

      const resp = await api.post("/auth/register-customer", payload, {
        headers,
      });

      const data: {
        accessToken?: string; // Expect final accessToken after registration
      } = resp.data;

      if (data.accessToken) {
        log("Đăng ký thành công!");
        login(data.accessToken); // <-- UPDATE AUTH CONTEXT with the final token

        // Clean up registration token
        localStorage.removeItem("registrationToken");

        // Redirect logic (same as in verifyOtp)
        const pendingTableId = localStorage.getItem("pendingTableId");
        const redirectPath = location.state?.from?.pathname || "/";
        const redirectSearch = location.state?.from?.search || "";

        if (pendingTableId && redirectPath === "/menu-order") {
          localStorage.removeItem("pendingTableId");
          navigate(`/menu-order?tableId=${pendingTableId}`, { replace: true });
        } else {
          navigate(redirectPath + redirectSearch, { replace: true });
        }
      } else {
        throw new Error(
          "Đăng ký thành công nhưng không nhận được token đăng nhập."
        );
      }
    } catch (error: any) {
      console.error("Đăng ký thất bại:", error);
      let errorMsg = "Đăng ký thất bại: ";
      if (isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          errorMsg =
            "Phiên đăng ký không hợp lệ hoặc đã hết hạn. Vui lòng thử lại từ đầu.";
          // Reset state and potentially clear tokens
          localStorage.removeItem("registrationToken");
          setStep("phone"); // Go back to phone input
        } else {
          errorMsg += error.response?.data?.message || error.message;
        }
      } else {
        errorMsg += error.message || "Lỗi không xác định.";
      }
      log(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // --- Render ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-lg space-y-4">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          {step === "register" ? "Hoàn tất hồ sơ" : "Đăng nhập / Đăng ký"}
        </h1>

        {/* --- Phone Input Step --- */}
        {step === "phone" && (
          <>
            <input
              type="tel"
              inputMode="tel"
              placeholder="Nhập số điện thoại (VD: 09xxxxxxxx)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              disabled={loading}
            />
            {/* reCAPTCHA Container */}
            <div
              ref={recaptchaContainerRef}
              id="recaptcha-container"
              className="my-4 flex justify-center"
            >
              {/* FirebaseUI will render here */}
            </div>
            <button
              onClick={sendOtp}
              disabled={loading || !phone} // Disable if no phone or loading
              className="w-full py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Đang gửi OTP..." : "Gửi mã OTP"}
            </button>
          </>
        )}

        {/* --- OTP Input Step --- */}
        {step === "otp" && (
          <>
            <p className="text-sm text-center text-gray-600">
              Nhập mã OTP gồm 6 chữ số đã gửi đến số {phone}.
            </p>
            <input
              type="number"
              inputMode="numeric"
              placeholder="------" // Placeholder for 6 digits
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6} // Limit input length
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center tracking-[1em] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition" // Styling for OTP input
              disabled={loading}
            />
            <button
              onClick={verifyOtp}
              disabled={loading || otp.length !== 6} // Disable if OTP length is not 6 or loading
              className="w-full py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xác thực..." : "Xác thực & Tiếp tục"}
            </button>
            <button
              onClick={() => {
                setStep("phone");
                setMessage("");
                setOtp("");
                confirmationResultRef.current = null;
              }} // Go back
              disabled={loading}
              className="w-full text-sm text-center text-gray-600 hover:text-orange-600 transition mt-2"
            >
              Đổi số điện thoại?
            </button>
          </>
        )}

        {/* --- Register Profile Step --- */}
        {step === "register" && (
          <div className="space-y-3">
            <p className="text-sm text-center text-gray-600">
              Đây là lần đầu bạn sử dụng dịch vụ. Vui lòng cung cấp thêm thông
              tin:
            </p>
            <input
              type="text"
              placeholder="Họ và tên (*)"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              required // Mark as required visually/semantically
            />
            <input
              type="email"
              inputMode="email"
              placeholder="Email (Không bắt buộc)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            />
            <input
              type="text"
              placeholder="Địa chỉ (Không bắt buộc)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            />
            <button
              onClick={registerProfile}
              disabled={loading || !fullName.trim()} // Disable if no name or loading
              className="w-full py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Đang lưu..." : "Hoàn tất đăng ký"}
            </button>
          </div>
        )}

        {/* --- Message Area --- */}
        {message && (
          <p
            className={`text-sm text-center ${
              message.includes("thất bại") || message.includes("Lỗi")
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default FirebaseOtpLogin;
