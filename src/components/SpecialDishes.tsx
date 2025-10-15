import { Badge } from "@/components/ui/badge";
import dish1 from "@/assets/dish1.jpg";
import dish2 from "@/assets/dish2.jpg";
import dish3 from "@/assets/dish3.jpg";
import dish4 from "@/assets/dish4.jpg";

const dishes = [
  { name: "Lompa with Meat", price: 12, image: dish1, rating: 5.0 },
  { name: "Fish and Veggie", price: 14, image: dish2, rating: 5.0 },
  { name: "Toffe's Cake", price: 10, image: dish3, rating: 5.0 },
  { name: "Egg and Cucumber", price: 8, image: dish4, rating: 5.0 },
];

const SpecialDishes = () => {
  return (
    <section className="py-20 px-4 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg className="absolute bottom-20 left-10 w-96 h-96" viewBox="0 0 200 200">
          <path d="M100,50 Q130,80 100,110 Q70,80 100,50" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="80" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <div className="container mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold">Our Special Dishes</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {dishes.map((dish, index) => (
            <div key={index} className="group animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="relative">
                <div className="aspect-square rounded-full overflow-hidden shadow-dish mb-6 hover-scale">
                  <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                </div>
                <Badge className="absolute top-4 right-4 bg-secondary text-secondary-foreground rounded-full px-3 py-1">
                  {dish.rating}
                </Badge>
              </div>

              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">{dish.name}</h3>
                <p className="text-muted-foreground text-sm">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do.
                </p>
                <p className="text-primary font-bold text-xl">${dish.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialDishes;
