import heroDish from "@/assets/hero-dish.jpg";
import MenuButton from "./MenuButton";
import BookingButton from "./BookingButton";

const WelcomeSection = () => {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg
          className="absolute top-20 right-20 w-64 h-64"
          viewBox="0 0 200 200"
        >
          <path
            d="M100,40 L100,160 M60,100 L140,100"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle
            cx="100"
            cy="100"
            r="50"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative animate-scale-in">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-[4rem] -rotate-6" />
            <div className="relative rounded-[4rem] overflow-hidden shadow-dish hover-scale">
              <img
                src={heroDish}
                alt="Welcome dish"
                className="w-full aspect-square object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 opacity-20">
              <svg viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-6 animate-fade-in">
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              Welcome to Our Restaurant
            </h2>

            <p className="text-muted-foreground text-lg">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>

            <div className="flex gap-4 pt-4">
              <MenuButton />
              <BookingButton />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
