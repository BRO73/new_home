import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
const BookingButton = () => {
  const navigate = useNavigate();

  const handleBookingClick = () => {
    navigate("/booking");
  };
  return (
    <Button
      size="lg"
      className="rounded-full"
      onClick={handleBookingClick}
    >
      BOOK A TABLE
    </Button>
  );
};

export default BookingButton;
