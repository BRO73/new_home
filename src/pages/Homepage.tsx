import HeroSection from "@/components/HeroSection";
import SpecialDishes from "@/components/SpecialDishes";
import WelcomeSection from "@/components/WelcomeSection";
import ChefSection from "@/components/ChefSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import NewsletterSection from "@/components/NewsletterSection";

const Homepage = () => {
  return (
    <div className="min-h-screen">
      <main>
        <HeroSection />
        <SpecialDishes />
        <WelcomeSection />
        <ChefSection />
        <TestimonialsSection />
        <NewsletterSection />
      </main>
    </div>
  );
};

export default Homepage;
