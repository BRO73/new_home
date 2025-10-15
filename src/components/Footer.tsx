import { Facebook, Instagram, Youtube, UtensilsCrossed } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted/30 py-12 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-serif text-xl font-bold">restaurant</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Viverra gravida morbi egestas facilisis tortor netus non duis tempor.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">MEMBER</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">MENU</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Take Out</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Catering</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Latest Schedule</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">FEATURED</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Terms of service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            © 2025 Restaurant. All Rights Reserved. Designed by Lovable
          </p>

          <div className="flex gap-4">
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
      </div>
    </footer>
  );
};

export default Footer;
