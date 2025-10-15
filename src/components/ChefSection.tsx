import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import chefImage from "@/assets/chef.jpg";

const features = [
  "Lorem ipsum dolor sit amet, consectetur.",
  "Lorem ipsum dolor sit amet, consectetur.",
  "Lorem ipsum dolor sit amet, consectetur.",
  "Lorem ipsum dolor sit amet, consectetur.",
];

const ChefSection = () => {
  return (
    <section className="py-20 px-4 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg className="absolute top-40 left-10 w-96 h-96" viewBox="0 0 200 200">
          <path d="M50,100 Q100,50 150,100 T250,100" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">Our Expert Chef</h2>

            <p className="text-muted-foreground">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="secondary" size="lg" className="rounded-full">
                Menu
              </Button>
              <Button size="lg" className="rounded-full">
                BOOK A TABLE
              </Button>
            </div>
          </div>

          <div className="relative animate-scale-in">
            <div className="absolute inset-0 bg-primary rounded-full scale-105 -z-10" />
            <div className="relative rounded-full overflow-hidden shadow-dish aspect-square">
              <img src={chefImage} alt="Expert chef" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChefSection;
