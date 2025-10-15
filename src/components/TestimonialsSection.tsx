import { Star } from "lucide-react";
import customer1 from "@/assets/customer1.jpg";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const testimonials = [
  {
    name: "Alex Thompson",
    role: "Food Critic",
    image: customer1,
    rating: 5,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Purus lorem id penatibus imperdiet. Turpis egestas ultricies purus auctor tincidunt lacus nunc.",
  },
  {
    name: "Sarah Johnson",
    role: "Regular Customer",
    image: customer1,
    rating: 5,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amazing food quality and excellent service. Highly recommended!",
  },
  {
    name: "Michael Chen",
    role: "Business Owner",
    image: customer1,
    rating: 5,
    text: "The best dining experience in town! The atmosphere is perfect for both casual and business dinners. Exceptional cuisine!",
  },
  {
    name: "Emily Rodriguez",
    role: "Chef Enthusiast",
    image: customer1,
    rating: 5,
    text: "Every dish is a masterpiece. The attention to detail and flavor combinations are absolutely outstanding. A must-visit!",
  },
  {
    name: "David Park",
    role: "Food Blogger",
    image: customer1,
    rating: 5,
    text: "I've visited dozens of restaurants, and this one stands out. Fresh ingredients, creative presentation, and warm hospitality.",
  },
];

const TestimonialsSection = () => {
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
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/2">
                  <div className="p-1 h-full">
                    <div className="bg-card rounded-3xl p-8 shadow-soft hover-scale h-full">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary">
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex gap-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                          ))}
                        </div>

                        <p className="text-muted-foreground">{testimonial.text}</p>

                        <div>
                          <p className="font-semibold">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
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
