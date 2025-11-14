import { Badge } from "@/components/ui/badge";
import dish1 from "@/assets/dish1.jpg";
import dish2 from "@/assets/dish2.jpg";
import dish3 from "@/assets/dish3.jpg";
import dish4 from "@/assets/dish4.jpg";
import { getTop4MostOrderedMenuItems } from "@/api/menuItem.api";
import { MenuItem } from "@/types";
import { useEffect, useState } from "react";

const fallbackImages = [dish1, dish2, dish3, dish4];

const SpecialDishes = () => {
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const data = await getTop4MostOrderedMenuItems();
        setDishes(data);
      } catch (error) {
        console.error("Failed to fetch dishes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-4 bg-muted/30 relative overflow-hidden">
        <div className="container mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Top Best-Selling Dishes
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover the dishes our guests love the most, carefully prepared to delight every taste and keep you coming back for more.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-square rounded-full bg-gray-300 mb-6"></div>
                <div className="space-y-2 text-center">
                  <div className="h-4 bg-gray-300 rounded mx-auto w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded mx-auto w-full"></div>
                  <div className="h-3 bg-gray-300 rounded mx-auto w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg
          className="absolute bottom-20 left-10 w-96 h-96"
          viewBox="0 0 200 200"
        >
          <path
            d="M100,50 Q130,80 100,110 Q70,80 100,50"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle
            cx="100"
            cy="80"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="container mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold">Top Best-Selling Dishes</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover the dishes our guests love the most, carefully prepared to delight every taste and keep you coming back for more.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {dishes.map((dish, index) => (
            <div
              key={dish.id}
              className="group animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative">
                <div className="aspect-square rounded-full overflow-hidden shadow-dish mb-6 hover-scale">
                  <img
                    src={dish.imageUrl || fallbackImages[index]}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = fallbackImages[index];
                    }}
                  />
                </div>
              </div>

              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">{dish.name}</h3>
                <p className="text-muted-foreground text-sm">
                  {dish.description ||
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do."}
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
