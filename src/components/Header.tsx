import { Button } from "@/components/ui/button";
import { UtensilsCrossed } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-serif text-xl font-bold">restaurant</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/menu" className="text-sm font-medium hover:text-primary transition-colors">
              Menu
            </Link>
            <Link to="/booking" className="text-sm font-medium hover:text-primary transition-colors">
              Booking
            </Link>
            <Link to="/gallery" className="text-sm font-medium hover:text-primary transition-colors">
              Gallery
            </Link>
            <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>

          <Button asChild size="lg" className="rounded-full">
            <Link to="/booking">BOOK A TABLE</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;