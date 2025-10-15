import { Button } from "@/components/ui/button";
import { UtensilsCrossed } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-serif text-xl font-bold">restaurant</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#menu" className="text-sm font-medium hover:text-primary transition-colors">
              Menu
            </a>
            <a href="#events" className="text-sm font-medium hover:text-primary transition-colors">
              Events
            </a>
            <a href="#gallery" className="text-sm font-medium hover:text-primary transition-colors">
              Gallery
            </a>
            <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </a>
            <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contact
            </a>
          </nav>

          <Button size="lg" className="rounded-full">
            BOOK A TABLE
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
