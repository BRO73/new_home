// FirebaseOtpModal.tsx
import { useState, useRef, useEffect } from "react";
import { signInWithPhoneNumber, ConfirmationResult, RecaptchaVerifier } from "firebase/auth";
import { auth } from "@/pages/FirebaseOtpLogin.tsx";

interface FirebaseOtpModalProps {
    phone: string;
    onSuccess: () => void;
    onClose: () => void;
}

export const FirebaseOtpModal: React.FC<FirebaseOtpModalProps> = ({ phone, onSuccess, onClose }) => {
    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const confirmationResultRef = useRef<ConfirmationResult | null>(null);
    const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
    const recaptchaRendered = useRef(false);

    // Khởi tạo reCAPTCHA khi component mount
    useEffect(() => {
        if (!recaptchaRendered.current && !otpSent) {
            try {
                recaptchaVerifierRef.current = new RecaptchaVerifier(
                    auth,
                    "recaptcha-container",
                    {
                        size: "normal", // Hiển thị reCAPTCHA visible
                        callback: () => {
                            console.log("reCAPTCHA solved");
                        },
                        "expired-callback": () => {
                            setMessage("reCAPTCHA đã hết hạn. Vui lòng thử lại.");
                        }
                    }
                );
                recaptchaVerifierRef.current.render();
                recaptchaRendered.current = true;
            } catch (e) {
                console.log("RecaptchaVerifier initialization error:", e);
            }
        }

        // Cleanup khi unmount
        return () => {
            if (recaptchaVerifierRef.current) {
                try {
                    recaptchaVerifierRef.current.clear();
                    recaptchaRendered.current = false;
                } catch (e) {
                    console.log("RecaptchaVerifier cleanup error:", e);
                }
            }
        };
    }, [otpSent]);

    const sendOtp = async () => {
        if (!phone) {
            setMessage("Số điện thoại không hợp lệ.");
            return;
        }

        // Format số điện thoại
        let e164 = phone.trim();
        if (e164.startsWith("0")) {
            e164 = "+84" + e164.substring(1);
        } else if (!e164.startsWith("+84")) {
            e164 = "+84" + e164;
        }

        setLoading(true);
        setMessage("Đang gửi OTP...");

        try {
            if (!recaptchaVerifierRef.current) {
                throw new Error("reCAPTCHA chưa được khởi tạo");
            }

            // Gửi OTP
            const confirmationResult = await signInWithPhoneNumber(
                auth,
                e164,
                recaptchaVerifierRef.current
            );

            confirmationResultRef.current = confirmationResult;
            setOtpSent(true);
            setMessage("✅ OTP đã được gửi đến số " + phone);
            setLoading(false);

        } catch (err: any) {
            console.error("Send OTP error:", err);

            let errorMsg = "Gửi OTP thất bại: ";
            if (err.code === "auth/invalid-phone-number") {
                errorMsg = "Số điện thoại không hợp lệ";
            } else if (err.code === "auth/too-many-requests") {
                errorMsg = "Quá nhiều yêu cầu. Vui lòng thử lại sau";
            } else if (err.code === "auth/quota-exceeded") {
                errorMsg = "Đã vượt quá giới hạn SMS. Vui lòng thử lại sau";
            } else if (err.code === "auth/captcha-check-failed") {
                errorMsg = "Vui lòng hoàn thành reCAPTCHA";
            } else {
                errorMsg += err.message;
            }

            setMessage(errorMsg);
            setLoading(false);

            // Reset recaptcha để thử lại
            if (recaptchaVerifierRef.current) {
                try {
                    recaptchaVerifierRef.current.clear();
                    recaptchaRendered.current = false;
                } catch (e) {
                    console.log("RecaptchaVerifier clear error:", e);
                }
            }
        }
    };

    const verifyOtp = async () => {
        if (!confirmationResultRef.current) {
            setMessage("Chưa gửi OTP. Vui lòng gửi OTP trước.");
            return;
        }

        if (!otp || otp.length !== 6) {
            setMessage("OTP phải gồm 6 chữ số");
            return;
        }

        setLoading(true);
        setMessage("Đang xác thực...");

        try {
            await confirmationResultRef.current.confirm(otp);
            setMessage("✅ Xác thực thành công!");
            setTimeout(() => {
                onSuccess();
            }, 500);
        } catch (err: any) {
            console.error("Verify OTP error:", err);

            let errorMsg = "Xác thực thất bại: ";
            if (err.code === "auth/invalid-verification-code") {
                errorMsg = "Mã OTP không đúng. Vui lòng kiểm tra lại";
            } else if (err.code === "auth/code-expired") {
                errorMsg = "Mã OTP đã hết hạn. Vui lòng gửi lại";
            } else {
                errorMsg += err.message;
            }

            setMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = () => {
        setOtp("");
        setOtpSent(false);
        setMessage("");
        confirmationResultRef.current = null;

        // Reset recaptcha
        if (recaptchaVerifierRef.current) {
            try {
                recaptchaVerifierRef.current.clear();
            } catch (e) {
                console.log("RecaptchaVerifier clear error:", e);
            }
        }
        recaptchaRendered.current = false;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl w-96 p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold text-center text-gray-800">
                    Xác thực số điện thoại
                </h2>

                <div className="text-center text-sm text-gray-600">
                    Số điện thoại: <strong>{phone}</strong>
                </div>

                {message && (
                    <div className={`text-sm text-center p-3 rounded-lg ${
                        message.includes("thất bại") || message.includes("không") || message.includes("Quá nhiều")
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                    }`}>
                        {message}
                    </div>
                )}

                {otpSent ? (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Nhập mã OTP (6 chữ số)
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                setOtp(value);
                            }}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                            autoFocus
                        />
                    </div>
                ) : (
                    <>
                        {/* Container cho reCAPTCHA visible */}
                        <div className="flex justify-center">
                            <div id="recaptcha-container"></div>
                        </div>
                    </>
                )}

                <div className="flex flex-col space-y-2">
                    {!otpSent ? (
                        <button
                            onClick={sendOtp}
                            disabled={loading}
                            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Đang gửi...
                                </span>
                            ) : (
                                "Gửi mã OTP"
                            )}
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={verifyOtp}
                                disabled={loading || otp.length !== 6}
                                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Đang xác thực...
                                    </span>
                                ) : (
                                    "Xác thực OTP"
                                )}
                            </button>

                            <button
                                onClick={handleResendOtp}
                                disabled={loading}
                                className="w-full text-blue-600 hover:text-blue-700 font-medium py-2 rounded-lg transition-colors"
                            >
                                Gửi lại mã OTP
                            </button>
                        </>
                    )}

                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 rounded-lg transition-colors"
                    >
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
}