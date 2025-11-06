import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Gift, Utensils, Star, Sparkles, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ThankYouPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const orderInfo = location.state?.orderInfo || {};
  const tableInfo = location.state?.tableInfo || {};

  const handlePlayGame = () => {
    navigate('/minigame', { 
      state: { 
        orderId: orderInfo.orderId,
        tableId: tableInfo.tableId || orderInfo.tableId 
      }
    });
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-success-light via-background to-[hsl(187,85%,95%)] relative overflow-hidden">
     
      
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-primary/10 animate-float" />
        <div className="absolute top-40 right-20 w-32 h-32 rounded-full bg-accent/10 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-1/4 w-24 h-24 rounded-full bg-primary/10 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-1/3 w-16 h-16 rounded-full bg-accent/10 animate-float" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-card/80 backdrop-blur-lg shadow-soft border-b border-border/50 py-6 animate-fade-in">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Utensils className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-primary to-[hsl(187,85%,43%)] bg-clip-text text-transparent">
              Nhà Hàng Riverside
            </h1>
          </div>
          <p className="text-base md:text-lg text-muted-foreground">
            Cảm ơn bạn đã lựa chọn chúng tôi
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-8 md:py-12 px-4">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          
          {/* Left Side - Thank You Card */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-card/95 backdrop-blur-xl rounded-3xl shadow-large border border-border/50 p-6 md:p-10 lg:p-12 relative overflow-hidden">
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              
              <div className="relative z-10">
                {/* Success Icon */}
                <div className="w-20 h-20 md:w-24 md:h-24 mx-auto lg:mx-0 mb-6 relative animate-scale-in">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-[hsl(187,85%,43%)] rounded-full animate-pulse-glow" />
                  <div className="absolute inset-1 bg-card rounded-full flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 md:h-12 md:w-12 text-primary" />
                  </div>
                </div>

                {/* Main Message */}
                <div className="text-center lg:text-left mb-8">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
                    Cảm ơn quý khách!
                  </h2>
                  <p className="text-lg md:text-xl lg:text-2xl text-foreground/90 mb-3 font-medium">
                    Cảm ơn bạn đã sử dụng dịch vụ của nhà hàng chúng tôi.
                  </p>
                  <p className="text-base md:text-lg text-muted-foreground">
                    Hy vọng bạn đã có những trải nghiệm ẩm thực tuyệt vời!
                  </p>
                </div>
                
                {/* Order Details Card */}
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-[hsl(187,85%,43%)]/10 rounded-2xl p-5 md:p-6 border border-primary/20 shadow-soft mb-6">
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-5">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                      <Utensils className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-foreground">Chi tiết dịch vụ</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {orderInfo.orderId && (
                      <div className="flex justify-between items-center py-2 border-b border-primary/10">
                        <span className="text-muted-foreground font-medium">Mã hóa đơn</span>
                        <span className="font-bold text-foreground text-sm md:text-base">{orderInfo.orderId}</span>
                      </div>
                    )}
                    {tableInfo.tableNumber && (
                      <div className="flex justify-between items-center py-2 border-b border-primary/10">
                        <span className="text-muted-foreground font-medium">Bàn số</span>
                        <span className="font-bold text-foreground text-sm md:text-base">{tableInfo.tableNumber}</span>
                      </div>
                    )}
                    {orderInfo.totalAmount && (
                      <div className="flex justify-between items-center pt-3">
                        <span className="text-foreground font-semibold">Tổng thanh toán</span>
                        <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-[hsl(187,85%,43%)] bg-clip-text text-transparent">
                          {orderInfo.totalAmount.toLocaleString()} VNĐ
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Home Button */}
                <Button
                  onClick={handleGoHome}
                  variant="outline"
                  size="lg"
                  className="w-full h-12 md:h-14 text-base md:text-lg font-bold border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:shadow-medium group"
                >
                  <Home className="h-5 w-5 mr-2 group-hover:animate-bounce-subtle" />
                  Quay về trang chủ
                </Button>
              </div>
            </div>
          </div>

          {/* Right Side - Minigame Promotion */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="relative rounded-3xl shadow-large overflow-hidden h-full">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent via-[hsl(25,95%,53%)] to-[hsl(0,72%,51%)]" />
              
              {/* Decorative Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-8 right-8 text-5xl md:text-6xl animate-bounce-subtle">🎁</div>
                <div className="absolute bottom-8 left-8 text-5xl md:text-6xl animate-bounce-subtle" style={{ animationDelay: '0.5s' }}>🎯</div>
                <div className="absolute top-1/2 left-1/4 text-3xl md:text-4xl animate-float">✨</div>
                <div className="absolute top-1/3 right-1/4 text-3xl md:text-4xl animate-float" style={{ animationDelay: '1s' }}>🌟</div>
              </div>
              
              <div className="relative z-10 p-6 md:p-10 lg:p-12 text-white h-full flex flex-col">
                {/* Gift Icon */}
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-large animate-bounce-subtle">
                  <Gift className="h-8 w-8 md:h-10 md:w-10 text-white" />
                </div>

                <div className="flex items-center justify-center gap-2 mb-6">
                  <Sparkles className="h-6 w-6 md:h-7 md:w-7 text-yellow-300 animate-pulse" />
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-center">
                    ƯU ĐÃI ĐẶC BIỆT!
                  </h2>
                  <Sparkles className="h-6 w-6 md:h-7 md:w-7 text-yellow-300 animate-pulse" />
                </div>
                
                <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-5 md:p-6 mb-6 border border-white/30 shadow-medium flex-1">
                  <p className="text-base md:text-lg lg:text-xl text-center mb-5 font-bold">
                    Tham gia <span className="text-yellow-300 text-lg md:text-xl lg:text-2xl">Vòng Quay May Mắn</span> để nhận ngay:
                  </p>
                  
                  <ul className="space-y-3 md:space-y-4">
                    {[
                      'Voucher giảm giá 10-20%',
                      'Gấu bông dễ thương',
                      'Sticker độc quyền',
                      'Và nhiều phần quà bí mật khác!'
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${0.6 + index * 0.1}s` }}>
                        <div className="w-8 h-8 bg-yellow-300/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                          <Star className="h-4 w-4 md:h-5 md:w-5 text-yellow-300" />
                        </div>
                        <span className="text-sm md:text-base font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 mb-6 border border-white/20">
                  <p className="text-xs md:text-sm text-center flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Mỗi tài khoản chỉ được tham gia 1 lần
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <Button
                    onClick={handleGoHome}
                    variant="secondary"
                    size="lg"
                    className="flex-1 h-12 md:h-14 text-base md:text-lg font-bold bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all duration-300 hover:scale-[1.02]"
                  >
                    Để sau
                  </Button>
                  <Button
                    onClick={handlePlayGame}
                    size="lg"
                    className="flex-1 h-12 md:h-14 text-base md:text-lg font-black bg-yellow-400 text-gray-900 hover:bg-yellow-300 shadow-large hover:shadow-xl transition-all duration-300 hover:scale-[1.05] animate-pulse-glow"
                  >
                    🎉 Chơi ngay!
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900/95 backdrop-blur-lg text-white py-6 mt-8 animate-fade-in">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm md:text-base text-gray-400">
            Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi. Hẹn gặp lại! ❤️
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ThankYouPage;
