import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Youtube } from "lucide-react";
import heroDish from "@/assets/hero-dish.jpg";
import restaurantInterior from "@/assets/restaurant-interior.jpg";

const HeroSection = () => {
  return (
    <section className="pt-32 pb-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg className="absolute top-20 right-10 w-64 h-64" viewBox="0 0 200 200">
          <path d="M100,20 Q120,40 100,60 Q80,40 100,20" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M100,60 L100,180" stroke="currentColor" strokeWidth="1" />
          <path d="M80,100 Q100,120 120,100" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border">
              <div className="flex gap-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-foreground" />
                ))}
              </div>
              <span className="text-sm font-medium">WELCOME</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              We provide the best food for you
            </h1>

            <p className="text-muted-foreground text-lg max-w-md">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>

            <div className="flex gap-4">
              <Button variant="secondary" size="lg" className="rounded-full">
                Menu
              </Button>
              <Button size="lg" className="rounded-full">
                BOOK A TABLE
              </Button>
            </div>

            <div className="flex gap-4 pt-4">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all hover-scale"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="relative animate-scale-in">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="aspect-square rounded-[3rem] overflow-hidden shadow-dish hover-scale">
                  <img src={heroDish} alt="Delicious noodle dish" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="space-y-6 pt-12">
                <div className="aspect-square rounded-[3rem] overflow-hidden shadow-dish hover-scale">
                  <img src={restaurantInterior} alt="Restaurant interior" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
