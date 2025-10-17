import { MenuItem } from "@/types";

interface MenuCardProps {
  item: MenuItem;
}

const MenuCard = ({ item }: MenuCardProps) => {
  return (
    <div className="flex items-center gap-4 py-6 transition-all duration-300 hover:-translate-y-1">
      {/* Circular image */}
      <div className="relative min-w-[90px] w-[90px] h-[90px] rounded-full overflow-hidden shadow-md flex-shrink-0 border-4 border-gray-100">
        <img
          src={
            item.imageUrl ||
            "https://beptueu.vn/hinhanh/tintuc/top-15-hinh-anh-mon-an-ngon-viet-nam-khien-ban-khong-the-roi-mat.jpeg"
          }
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-2 overflow-hidden">
        {/* Name and Price with dotted line */}
        <div className="flex items-start gap-3 w-full">
          <h3 className="text-lg font-semibold text-gray-900 whitespace-nowrap">
            {item.name}
          </h3>

          {/* Dotted line */}
          <div className="flex-1 border-b-2 border-dotted border-gray-300 self-center mb-1" />

          <span className="text-lg font-bold text-[#d4a574] whitespace-nowrap">
            ${item.price}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 italic line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      </div>
    </div>
  );
};

export default MenuCard;
