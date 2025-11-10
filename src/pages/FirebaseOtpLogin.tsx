import { isAxiosError } from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import api from "@/api/axiosInstance";
import { useAuth } from "@/hooks/useAuth";

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | undefined;
    confirmationResult: ConfirmationResult | undefined;
  }
}

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
export const auth = getAuth(app);
auth.languageCode = "vi";

const FirebaseOtpLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "register">("phone");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  const log = (msg: string) => setMessage(msg);

  const clearRecaptcha = () => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = undefined;
      if (recaptchaContainerRef.current) {
        recaptchaContainerRef.current.innerHTML = "";
      }
    }
  };

  const setupRecaptcha = () => {
    clearRecaptcha();
    if (recaptchaContainerRef.current) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        recaptchaContainerRef.current,
        {
          size: "normal",
          callback: () => {},
          "expired-callback": () => {
            log("reCAPTCHA đã hết hạn, vui lòng thử lại.");
            clearRecaptcha();
            setupRecaptcha();
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

  useEffect(() => {
    if (step === "phone" && recaptchaContainerRef.current) {
      setupRecaptcha();
    }

    return () => {
      clearRecaptcha();
    };
  }, [step]);

  const sendOtp = async () => {
    if (!phone) return log("Vui lòng nhập số điện thoại.");
    if (!window.recaptchaVerifier) return log("reCAPTCHA chưa sẵn sàng.");

    let e164 = phone.trim();
    if (e164.startsWith("0")) {
      e164 = "+84" + e164.substring(1);
    } else if (!e164.startsWith("+84")) {
      e164 = "+84" + e164;
    }

    setLoading(true);
    setMessage("");
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
      clearRecaptcha();
      setupRecaptcha();
    } finally {
      setLoading(false);
    }
  };

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
      const idToken = await user.getIdToken(true);

      log("Firebase xác thực thành công. Đang kiểm tra với máy chủ...");

      const resp = await api.post(
        `/auth/verify-firebase?idToken=${encodeURIComponent(idToken)}`
      );

      const data: {
        accessToken?: string;
        registrationToken?: string;
        isNewUser?: boolean;
      } = resp.data;

      if (data.accessToken && !data.registrationToken) {
        log("Đăng nhập thành công!");
        
        // 🆕 SỬ DỤNG HÀM LOGIN MỚI VỚI PHONE PARAMETER
        login(data.accessToken, phone);
        
        // 🆕 KHÔNG CẦN LƯU USERPHONE Ở ĐÂY NỮA VÌ ĐÃ XỬ LÝ TRONG LOGIN

        const pendingTableId = localStorage.getItem("pendingTableId");
        const redirectPath = location.state?.from?.pathname || "/";
        const redirectSearch = location.state?.from?.search || "";

        if (pendingTableId && redirectPath === "/menu-order") {
          localStorage.removeItem("pendingTableId");
          navigate(`/menu-order?tableId=${pendingTableId}`, { replace: true });
        } else {
          navigate(redirectPath + redirectSearch, { replace: true });
        }
      }
      else if (data.registrationToken || data.isNewUser) {
        log("Xác thực thành công. Vui lòng hoàn tất hồ sơ.");
        if (data.registrationToken) {
          localStorage.setItem("registrationToken", data.registrationToken);
        }
        setStep("register");
      }
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
      } else {
        errorMsg += error.message || "Lỗi không xác định.";
      }
      log(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const registerProfile = async () => {
    if (!fullName.trim()) return log("Vui lòng nhập họ tên.");

    setLoading(true);
    setMessage("");
    log("Đang đăng ký thông tin...");

    const registrationToken = localStorage.getItem("registrationToken");
    const registeredPhone = phone;

    try {
      const payload = {
        phoneNumber: registeredPhone,
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
      };

      const headers = registrationToken
        ? { Authorization: `Bearer ${registrationToken}` }
        : {};

      const resp = await api.post("/auth/register-customer", payload, {
        headers,
      });

      const data: {
        accessToken?: string;
      } = resp.data;

      if (data.accessToken) {
        log("Đăng ký thành công!");
        
        // 🆕 SỬ DỤNG HÀM LOGIN MỚI VỚI PHONE PARAMETER
        login(data.accessToken, phone);
        
        // 🆕 KHÔNG CẦN LƯU USERPHONE Ở ĐÂY NỮA VÌ ĐÃ XỬ LÝ TRONG LOGIN

        localStorage.removeItem("registrationToken");

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
          localStorage.removeItem("registrationToken");
          setStep("phone");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-lg space-y-4">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          {step === "register" ? "Hoàn tất hồ sơ" : "Đăng nhập / Đăng ký"}
        </h1>

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
            <div
              ref={recaptchaContainerRef}
              id="recaptcha-container"
              className="my-4 flex justify-center"
            ></div>
            <button
              onClick={sendOtp}
              disabled={loading || !phone}
              className="w-full py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Đang gửi OTP..." : "Gửi mã OTP"}
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <p className="text-sm text-center text-gray-600">
              Nhập mã OTP gồm 6 chữ số đã gửi đến số {phone}.
            </p>
            <input
              type="number"
              inputMode="numeric"
              placeholder="------"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center tracking-[1em] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              disabled={loading}
            />
            <button
              onClick={verifyOtp}
              disabled={loading || otp.length !== 6}
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
              }}
              disabled={loading}
              className="w-full text-sm text-center text-gray-600 hover:text-orange-600 transition mt-2"
            >
              Đổi số điện thoại?
            </button>
          </>
        )}

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
              required
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
              disabled={loading || !fullName.trim()}
              className="w-full py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Đang lưu..." : "Hoàn tất đăng ký"}
            </button>
          </div>
        )}

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