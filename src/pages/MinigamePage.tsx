import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, RotateCcw, Gift } from 'lucide-react';

// Danh sách phần thưởng
const SECTORS = [
  { color: "#FF6B6B", text: "#FFFFFF", label: "Gấu bông", type: "toy" },
  { color: "#4ECDC4", text: "#FFFFFF", label: "Voucher 15%", type: "voucher_15" },
  { color: "#FFD166", text: "#000000", label: "May mắn", type: "none" },
  { color: "#06D6A0", text: "#FFFFFF", label: "Voucher 10%", type: "voucher_10" },
  { color: "#118AB2", text: "#FFFFFF", label: "Sticker", type: "sticker" },
  { color: "#073B4C", text: "#FFFFFF", label: "Voucher 20%", type: "voucher_20" },
  { color: "#7209B7", text: "#FFFFFF", label: "Gấu bông", type: "toy" },
  { color: "#F72585", text: "#FFFFFF", label: "Voucher 15%", type: "voucher_15" },
  { color: "#3A86FF", text: "#FFFFFF", label: "Sticker", type: "sticker" },
  { color: "#FB5607", text: "#FFFFFF", label: "Quà bí mật", type: "mystery" }
];

const MinigamePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spinButtonRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  
  // Kích thước responsive
  const isMobile = windowSize.width < 768;
  const dia = isMobile ? Math.min(windowSize.width - 40, 400) : 600;
  const rad = dia / 2;
  const PI = Math.PI;
  const TAU = 2 * PI;
  const arc = TAU / SECTORS.length;
  
  // Sử dụng useRef cho tất cả biến animation để tránh re-render
  const frictionRef = useRef(0.991);
  const angVelRef = useRef(0);
  const angRef = useRef(0);
  const spinButtonClickedRef = useRef(false);

  useEffect(() => {
    // Kiểm tra userPhone - nếu không có thì chuyển hướng sang trang lỗi
    const userPhone = localStorage.getItem('userPhone');
    if (!userPhone) {
      navigate('/error', { 
        state: { 
          message: 'Bạn cần đăng nhập để tham gia minigame!',
          redirectTo: '/otp-login'
        } 
      });
      return;
    }

    // Kiểm tra xem số điện thoại này đã quay chưa
    const userPlayedKey = `minigame_played_${userPhone}`;
    const hasUserPlayed = localStorage.getItem(userPlayedKey) === 'true';
    
    if (hasUserPlayed) {
      setHasPlayed(true);
      // Load kết quả đã quay trước đó nếu có
      const savedResultKey = `minigame_result_${userPhone}`;
      const savedResult = localStorage.getItem(savedResultKey);
      if (savedResult) {
        setResult(JSON.parse(savedResult));
      }
    }

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Kiểm tra nếu có order info và đã quay rồi thì chuyển hướng
    const hasOrderInfo = location.state?.orderId;
    
    if (hasUserPlayed && hasOrderInfo) {
      navigate('/thank-you', { 
        state: { 
          message: 'Bạn đã tham gia minigame rồi!',
          ...location.state 
        } 
      });
    }

    initWheel();
    
    // Start animation loop
    const engine = () => {
      frame();
      animationRef.current = requestAnimationFrame(engine);
    };
    animationRef.current = requestAnimationFrame(engine);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [navigate, location.state]);

  useEffect(() => {
    // Re-init wheel when window size changes
    initWheel();
  }, [windowSize.width]);

  const getIndex = () => {
    return Math.floor(SECTORS.length - (angRef.current / TAU) * SECTORS.length) % SECTORS.length;
  };

  const drawSector = (sector: any, i: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ang = arc * i;
    ctx.save();

    // Vẽ sector
    ctx.beginPath();
    ctx.fillStyle = sector.color;
    ctx.moveTo(rad, rad);
    ctx.arc(rad, rad, rad, ang, ang + arc);
    ctx.lineTo(rad, rad);
    ctx.fill();

    // Vẽ viền
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Vẽ text - font size responsive
    const fontSize = isMobile ? 14 : 20;
    ctx.translate(rad, rad);
    ctx.rotate(ang + arc / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = sector.text;
    ctx.font = `bold ${fontSize}px Lato, sans-serif`;
    ctx.fillText(sector.label, rad - (isMobile ? 15 : 20), 10);

    ctx.restore();
  };

  const rotate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const sector = SECTORS[getIndex()];
    
    // Áp dụng transform cho canvas - SỬ DỤNG transform TRỰC TIẾP
    canvas.style.transform = `rotate(${angRef.current - PI / 2}rad)`;

    // Cập nhật nút quay
    if (spinButtonRef.current) {
      if (hasPlayed) {
        spinButtonRef.current.textContent = 'ĐÃ QUAY';
        spinButtonRef.current.style.background = '#9CA3AF';
        spinButtonRef.current.style.color = '#FFFFFF';
      } else {
        spinButtonRef.current.textContent = !angVelRef.current ? 'QUAY' : sector.label;
        spinButtonRef.current.style.background = sector.color;
        spinButtonRef.current.style.color = sector.text;
      }
    }
  };

  const frame = () => {
    // Kiểm tra nếu vòng quay đã dừng và đã click
    if (angVelRef.current < 0.002 && spinButtonClickedRef.current) {
      angVelRef.current = 0;
      const finalSector = SECTORS[getIndex()];
      handleSpinEnd(finalSector);
      spinButtonClickedRef.current = false;
    }

    // Cập nhật vật lý quay
    if (angVelRef.current > 0) {
      angVelRef.current *= frictionRef.current;
      angRef.current += angVelRef.current;
      angRef.current %= TAU;
      rotate();
    }
  };

  const handleSpinEnd = (sector: any) => {
    setIsSpinning(false);
    setResult(sector);
    setShowResult(true);
    setHasPlayed(true);
    
    const userPhone = localStorage.getItem('userPhone');
    if (userPhone) {
      // Đánh dấu số điện thoại này đã quay
      localStorage.setItem(`minigame_played_${userPhone}`, 'true');
      // Lưu kết quả quay
      localStorage.setItem(`minigame_result_${userPhone}`, JSON.stringify(sector));
    }
    
    // 🆕 LƯU PHẦN THƯỞNG CHO NGƯỜI DÙNG
    if (sector.type !== 'none') {
      if (userPhone) {
        // Lấy danh sách phần thưởng hiện tại
        const userRewardsKey = `rewards_${userPhone}`;
        const currentRewards = JSON.parse(localStorage.getItem(userRewardsKey) || '[]');
        
        // Thêm phần thưởng mới
        const newReward = {
          id: Date.now(),
          type: sector.type,
          label: sector.label,
          color: sector.color,
          date: new Date().toISOString(),
          claimed: false
        };
        
        currentRewards.push(newReward);
        localStorage.setItem(userRewardsKey, JSON.stringify(currentRewards));
        
        // Đánh dấu có phần thưởng mới để hiển thị trong header
        localStorage.setItem('hasNewReward', 'true');
      }
    }
  };

  const initWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Vẽ các sector
    SECTORS.forEach((sector, i) => {
      drawSector(sector, i);
    });

    // Khởi tạo rotation ban đầu
    rotate();
  };

  const spinWheel = () => {
    if (isSpinning || angVelRef.current > 0 || hasPlayed) return;

    setIsSpinning(true);
    spinButtonClickedRef.current = true;
    
    // Tạo tốc độ quay ngẫu nhiên - GIỐNG HTML MẪU
    const rand = (m: number, M: number) => Math.random() * (M - m) + m;
    angVelRef.current = rand(0.25, 0.45);
  };

  const closeResult = () => {
    setShowResult(false);
    if (location.state?.orderId) {
      navigate('/thank-you', { 
        state: { 
          message: result.type === 'none' ? 'Cảm ơn bạn đã tham gia!' : 'Chúc mừng bạn đã nhận được quà!',
          prize: result,
          ...location.state 
        } 
      });
    }
  };

  const getPrizeIcon = (type: string) => {
    switch (type) {
      case 'voucher_10':
      case 'voucher_15':
      case 'voucher_20':
        return '🎫';
      case 'sticker':
        return '🏷️';
      case 'toy':
        return '🧸';
      case 'mystery':
        return '🎁';
      default:
        return '⭐';
    }
  };

  const getPrizeMessage = (prize: any) => {
    if (prize.type === 'none') {
      return {
        title: 'Cảm Ơn Bạn!',
        message: 'Chúc bạn may mắn lần sau!',
        description: 'Cảm ơn bạn đã tham gia minigame! Hẹn gặp lại quý khách hàng ở lần sau!'
      };
    }
    
    const messages: any = {
      voucher_10: { 
        title: 'Chúc Mừng!', 
        message: 'Bạn nhận được Voucher 10%', 
        description: 'Giảm 10% cho đơn hàng tiếp theo. Hẹn gặp lại quý khách hàng ở lần sau!' 
      },
      voucher_15: { 
        title: 'Chúc Mừng!', 
        message: 'Bạn nhận được Voucher 15%', 
        description: 'Giảm 15% cho đơn hàng tiếp theo. Hẹn gặp lại quý khách hàng ở lần sau!' 
      },
      voucher_20: { 
        title: 'Chúc Mừng!', 
        message: 'Bạn nhận được Voucher 20%', 
        description: 'Giảm 20% cho đơn hàng tiếp theo. Hẹn gặp lại quý khách hàng ở lần sau!' 
      },
      sticker: { 
        title: 'Chúc Mừng!', 
        message: 'Bạn nhận được Sticker độc quyền', 
        description: 'Bộ sticker dễ thương. Hẹn gặp lại quý khách hàng ở lần sau!' 
      },
      toy: { 
        title: 'Chúc Mừng!', 
        message: 'Bạn nhận được Gấu bông', 
        description: 'Gấu bông siêu dễ thương. Hẹn gặp lại quý khách hàng ở lần sau!' 
      },
      mystery: { 
        title: 'Chúc Mừng!', 
        message: 'Bạn nhận được Phần quà bí mật', 
        description: 'Bất ngờ đang chờ bạn! Hẹn gặp lại quý khách hàng ở lần sau!' 
      }
    };
    
    return messages[prize.type] || messages.voucher_10;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        {/* Header */}
        <div className="text-center mb-4 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-3">
            🎡 Vòng Quay May Mắn
          </h1>
          <p className="text-base md:text-xl text-gray-600">
            Quay và nhận phần thưởng hấp dẫn!
          </p>
        </div>

        {/* Wheel Container */}
        <div className="relative mb-6 md:mb-8 flex justify-center items-center">
          <div 
            id="spin_the_wheel" 
            className="inline-block relative overflow-hidden rounded-full shadow-2xl"
            style={{ 
              width: dia, 
              height: dia,
            }}
          >
            <canvas
              ref={canvasRef}
              width={dia}
              height={dia}
              className="block rounded-full"
              style={{
                transform: `rotate(${-PI/2}rad)`
              }}
            />
            
            {/* Nút quay với mũi tên */}
            <div
              ref={spinButtonRef}
              id="spin"
              onClick={hasPlayed ? undefined : spinWheel}
              className="absolute flex items-center justify-center rounded-full cursor-pointer select-none transition-all duration-800"
              style={{
                font: isMobile ? 'bold 16px Lato, sans-serif' : 'bold 24px Lato, sans-serif',
                userSelect: 'none',
                top: '50%',
                left: '50%',
                width: '30%',
                height: '30%',
                margin: '-15%',
                background: hasPlayed ? '#9CA3AF' : SECTORS[0].color,
                color: hasPlayed ? '#FFFFFF' : SECTORS[0].text,
                boxShadow: '0 0 0 8px currentColor, 0 0px 15px 5px rgba(0, 0, 0, 0.6)',
                cursor: hasPlayed ? 'not-allowed' : 'pointer',
                opacity: hasPlayed ? 0.7 : 1,
              }}
            >
              {hasPlayed ? 'ĐÃ QUAY' : 'QUAY'}
            </div>
          </div>
        </div>

        {/* Spin Button */}
        <div className="text-center mb-6 md:mb-8">
          <button
            onClick={spinWheel}
            disabled={isSpinning || angVelRef.current > 0 || hasPlayed}
            className={`px-8 md:px-12 py-3 md:py-4 text-lg md:text-xl font-bold text-white rounded-full shadow-xl transition-all duration-300 ${
              hasPlayed
                ? 'bg-gray-400 cursor-not-allowed' 
                : isSpinning || angVelRef.current > 0
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transform hover:scale-105'
            }`}
          >
            {hasPlayed ? (
              '🎯 BẠN ĐÃ QUAY RỒI'
            ) : isSpinning ? (
              <div className="flex items-center justify-center gap-2 md:gap-3">
                <div className="w-5 h-5 md:w-6 md:h-6 border-2 md:border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang quay...
              </div>
            ) : (
              '🎯 QUAY NGAY!'
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 md:mt-8 p-4 md:p-6 bg-white rounded-2xl shadow-lg border border-gray-200 max-w-md mx-auto">
          <div className="text-center text-sm md:text-base text-gray-700 space-y-2 md:space-y-3">
            <p className="flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg">
              <span className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full"></span>
              Mỗi số điện thoại chỉ được tham gia 1 lần
            </p>
            <p className="flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg">
              <span className="w-2 h-2 md:w-3 md:h-3 bg-blue-500 rounded-full"></span>
              Phần thưởng sẽ được lưu vào tài khoản của bạn
            </p>
          </div>
        </div>

        {/* Result Modal */}
        {showResult && result && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className={`rounded-3xl p-6 md:p-8 max-w-md w-full text-center relative shadow-2xl border-4 ${
              result.type === 'none' 
                ? 'bg-gradient-to-br from-gray-50 to-blue-50 border-blue-200' 
                : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300'
            }`}>
              <button
                onClick={closeResult}
                className="absolute top-3 right-3 md:top-4 md:right-4 w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-white hover:bg-opacity-50 rounded-full transition-colors"
              >
                <X className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
              </button>

              <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 text-3xl md:text-4xl shadow-lg border-4 ${
                result.type === 'none' 
                  ? 'bg-blue-100 border-blue-200' 
                  : 'bg-yellow-100 border-yellow-300'
              }`}>
                {getPrizeIcon(result.type)}
              </div>

              <h2 className={`text-2xl md:text-3xl font-bold mb-2 md:mb-3 ${
                result.type === 'none' ? 'text-gray-800' : 'text-orange-600'
              }`}>
                {getPrizeMessage(result).title}
              </h2>
              
              <p className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                {getPrizeMessage(result).message}
              </p>
              
              <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">
                {getPrizeMessage(result).description}
              </p>

              {result.type !== 'none' && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-3 md:p-4 mb-4 md:mb-6">
                  <p className="text-xs md:text-sm text-green-800 flex items-center justify-center gap-2 font-medium">
                    <Gift className="h-3 w-3 md:h-4 md:w-4" />
                    Phần thưởng đã được lưu vào tài khoản của bạn!
                  </p>
                </div>
              )}

              <button
                onClick={closeResult}
                className={`w-full py-3 text-white rounded-xl font-bold transition-all hover:scale-105 ${
                  result.type === 'none' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' 
                    : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                }`}
              >
                {result.type === 'none' ? 'Đồng Ý' : 'Tuyệt Vời!'}
              </button>
            </div>
          </div>
        )}

        {/* Exit Button */}
        <button
          onClick={() => navigate('/thank-you')}
          className="fixed top-4 right-4 md:top-6 md:right-6 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-white hover:bg-opacity-50 rounded-full transition-all duration-300 backdrop-blur-sm shadow-lg"
        >
          <X className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />
        </button>
      </div>

      {/* CSS cho mũi tên */}
      <style>
        {`
          #spin::after {
            content: "";
            position: absolute;
            top: -17px;
            left: 50%;
            transform: translateX(-50%);
            border: 10px solid transparent;
            border-bottom-color: currentColor;
            border-top: none;
          }
          
          @media (max-width: 767px) {
            #spin::after {
              top: -14px;
              border-width: 8px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default MinigamePage;