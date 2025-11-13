import { Star } from "lucide-react";
import customer1 from "@/assets/customer1.jpg";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getTop5Reviews } from "@/api/review.api";
import { Review } from "@/types";
import { useEffect, useState } from "react";

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const data = await getTop5Reviews();
        setTestimonials(data);
      } catch (error) {
        console.error("Failed to fetch testimonials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="container mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold">Our Happy Customers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
          <div className="max-w-5xl mx-auto px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-card rounded-3xl p-8 shadow-soft h-full">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-20 h-20 rounded-full bg-gray-300 border-4 border-primary"></div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-5 h-5 bg-gray-300 rounded"></div>
                        ))}
                      </div>
                      <div className="space-y-2 w-full">
                        <div className="h-4 bg-gray-300 rounded w-full"></div>
                        <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-32"></div>
                        <div className="h-3 bg-gray-300 rounded w-24 mx-auto"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg className="absolute bottom-20 right-20 w-96 h-96" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <div className="container mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold">Our Happy Customers</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/2">
                  <div className="p-1 h-full">
                    <div className="bg-card rounded-3xl p-8 shadow-soft hover-scale h-full">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary">
                          <img
                            src={customer1}
                            alt={testimonial.customerName}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex gap-1">
                          {[...Array(testimonial.ratingScore)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                          ))}
                        </div>

                        <p className="text-muted-foreground">{testimonial.comment}</p>

                        <div>
                          <p className="font-semibold">{testimonial.customerName}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hover:bg-primary hover:text-primary-foreground" />
            <CarouselNext className="hover:bg-primary hover:text-primary-foreground" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;