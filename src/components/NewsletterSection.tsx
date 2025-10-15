import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import newsletterBg from "@/assets/newsletter-bg.jpg";

const NewsletterSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div
          className="relative rounded-[3rem] overflow-hidden shadow-dish"
          style={{
            backgroundImage: `url(${newsletterBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-secondary/90" />
          
          <div className="relative z-10 py-16 px-8 text-center space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary-foreground">
              Get Or Promo Code by
              <br />
              Subscribing To our Newsletter
            </h2>

            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-background border-0 h-12 rounded-full px-6"
              />
              <Button size="lg" className="rounded-full whitespace-nowrap">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
