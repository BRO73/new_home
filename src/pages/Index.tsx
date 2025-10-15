import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import SpecialDishes from "@/components/SpecialDishes";
import WelcomeSection from "@/components/WelcomeSection";
import ChefSection from "@/components/ChefSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <SpecialDishes />
        <WelcomeSection />
        <ChefSection />
        <TestimonialsSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
