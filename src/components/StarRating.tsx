import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

const StarRating = ({ rating, onRatingChange }: StarRatingProps) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleStarClick = (selectedRating: number) => {
    onRatingChange(selectedRating);
  };

  const handleStarHover = (hoveredStar: number) => {
    setHoveredRating(hoveredStar);
  };

  const handleMouseLeave = () => {
    setHoveredRating(0);
  };

  const displayRating = hoveredRating || rating;

  return (
    <div 
      className="flex gap-2 justify-center"
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleStarClick(star)}
          onMouseEnter={() => handleStarHover(star)}
          className="transition-all duration-300 ease-out hover:scale-125 focus:outline-none focus:scale-125"
          aria-label={`Rate ${star} out of 5 stars`}
        >
          <Star
            className={cn(
              "w-10 h-10 md:w-12 md:h-12 transition-all duration-300",
              star <= displayRating
                ? "fill-[#f4b33b] stroke-[#f4b33b]"
                : "fill-transparent stroke-gray-300"
            )}
            strokeWidth={2}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;