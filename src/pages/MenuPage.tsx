import { useState, useMemo, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import MenuCard from "@/components/MenuCard";
import { MenuItem, PageResponse } from "@/types";
import { getAllCategories, getMenuItemsPaged } from "@/api/menu.api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch menu items with pagination
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response: PageResponse<MenuItem> = await getMenuItemsPaged(
          currentPage - 1,
          itemsPerPage
        );

        setMenuItems(response.content);
        setTotalPages(response.totalPages);
        setTotalItems(response.totalElements);
      } catch (err) {
        setError("Failed to load menu items");
        console.error("Error fetching menu items:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, [currentPage, itemsPerPage]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError(null);
        const categoriesData: string[] = await getAllCategories();
        setCategories(["All", ...categoriesData]);
      } catch (err) {
        setCategoriesError("Failed to load categories");
        console.error("Error fetching categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    if (!menuItems) return [];

    return menuItems.filter((item: MenuItem) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, selectedCategory]);

  // Reset to page 1 when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen mt-10">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8 mt-4">
          <p className="text-xs font-medium tracking-[0.2em] text-gray-500 uppercase mb-2">
            MENU
          </p>
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-gray-900">
            Check Our Tasty Menu
          </h1>
        </div>
        {/* Category Filter */}
        <div className="flex justify-center mb-12">
          {categoriesLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-[#d4a574]" />
          ) : categoriesError ? (
            <p className="text-red-500 text-sm">{categoriesError}</p>
          ) : (
            <div className="flex gap-6 flex-wrap justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`text-base px-4 py-2 transition-all duration-300 border-b-2 ${
                    selectedCategory === category
                      ? "text-[#d4a574] font-semibold border-[#d4a574]"
                      : "text-gray-500 border-transparent hover:text-[#d4a574]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Menu Items */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-[#d4a574]" />
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <p className="text-xl text-red-500">
              Error loading menu items. Please try again later.
            </p>
          </div>
        )}

        {!isLoading && !error && filteredItems.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">
              No items found matching your criteria.
            </p>
          </div>
        )}

        {!isLoading && !error && filteredItems.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {filteredItems.map((item: MenuItem) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-12">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-gray-300 hover:bg-[#d4a574]/10 hover:text-[#d4a574] hover:border-[#d4a574]"
                >
                  Previous
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                    className={
                      currentPage === page
                        ? "bg-[#d4a574] hover:bg-[#c9956a] text-white"
                        : "border-gray-300 hover:bg-[#d4a574]/10 hover:text-[#d4a574] hover:border-[#d4a574]"
                    }
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-gray-300 hover:bg-[#d4a574]/10 hover:text-[#d4a574] hover:border-[#d4a574]"
                >
                  Next
                </Button>
              </div>
            </div>

            {/* Page info */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                Page {currentPage} of {totalPages} • Showing{" "}
                {filteredItems.length} of {totalItems} items
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
