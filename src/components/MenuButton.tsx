import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
const MenuButton = () => {
  const navigate = useNavigate();

  const handleMenuClick = () => {
    navigate("/menu");
  };
  return (
    <Button
      variant="secondary"
      size="lg"
      className="rounded-full"
      onClick={handleMenuClick}
    >
      Menu
    </Button>
  );
};

export default MenuButton;
