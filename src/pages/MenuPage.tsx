import { useState, useMemo, useEffect, useRef } from "react";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import MenuCard from "@/components/MenuCard";
import { MenuItem, PageResponse, CategoryResponse } from "@/types";
import { getAllCategories, getMenuItemsPaged } from "@/api/menu.api";
import { getMenuItemsByCategory } from "@/api/menuItem.api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);
  const categoriesContainerRef = useRef<HTMLDivElement>(null);

  // Fetch all menu items for search functionality
  useEffect(() => {
    const fetchAllMenuItems = async () => {
      try {
        const response: PageResponse<MenuItem> = await getMenuItemsPaged(0, 1000);
        setAllMenuItems(response.content);
      } catch (err) {
        console.error("Error fetching all menu items:", err);
      }
    };

    fetchAllMenuItems();
  }, []);

  // Fetch menu items with pagination or by category
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (selectedCategoryId !== null) {
          // Fetch by category - we'll get all items and handle pagination client-side
          const categoryItems = await getMenuItemsByCategory(selectedCategoryId);
          setMenuItems(categoryItems);
          setTotalPages(Math.ceil(categoryItems.length / itemsPerPage));
          setTotalItems(categoryItems.length);
        } else {
          // Fetch with server-side pagination
          const response: PageResponse<MenuItem> = await getMenuItemsPaged(
            currentPage - 1,
            itemsPerPage
          );

          setMenuItems(response.content);
          setTotalPages(response.totalPages);
          setTotalItems(response.totalElements);
        }
      } catch (err) {
        setError("Failed to load menu items");
        console.error("Error fetching menu items:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, [currentPage, itemsPerPage, selectedCategoryId]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError(null);

        const categoriesData = await getAllCategories();

        let processedCategories: CategoryResponse[] = [];

        if (categoriesData && Array.isArray(categoriesData)) {
          processedCategories = categoriesData
            .filter(
              (category) =>
                category &&
                category.id !== undefined &&
                category.id !== null &&
                category.name &&
                category.name.trim() !== ""
            )
            .map((category) => ({
              id: Number(category.id),
              name: String(category.name).trim(),
            }));

          if (processedCategories.length > 0) {
            processedCategories.sort((a, b) => a.name.localeCompare(b.name));
          }
        } else {
          console.error("Categories data is not an array:", categoriesData);
          processedCategories = [];
        }

        const finalCategories = [
          { id: 0, name: "All" },
          ...processedCategories,
        ];
        setCategories(finalCategories);
      } catch (err) {
        console.error("ERROR in fetchCategories:", err);
        setCategoriesError("Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (categoryName: string, categoryId: number) => {
    setSelectedCategory(categoryName);

    if (categoryName === "All") {
      setSelectedCategoryId(null);
    } else {
      setSelectedCategoryId(categoryId);
    }

    setCurrentPage(1);
  };

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    let itemsToSearch = [];

    if (selectedCategoryId !== null) {
      // When category is selected, search within the category items
      itemsToSearch = menuItems;
    } else {
      // When no category is selected, search within all items
      itemsToSearch = allMenuItems;
    }

    if (!itemsToSearch || itemsToSearch.length === 0) {
      return [];
    }

    return itemsToSearch.filter((item: MenuItem) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesSearch;
    });
  }, [searchQuery, menuItems, allMenuItems, selectedCategoryId]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Calculate items to display based on current state
  const itemsToDisplay = useMemo(() => {
    if (searchQuery.trim() || selectedCategoryId !== null) {
      // Client-side pagination for search and category filter
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return filteredItems.slice(startIndex, endIndex);
    } else {
      // Server-side pagination for normal case
      return menuItems;
    }
  }, [searchQuery, selectedCategoryId, currentPage, itemsPerPage, filteredItems, menuItems]);

  // Calculate total pages based on current state
  const getDisplayTotalPages = () => {
    if (searchQuery.trim() || selectedCategoryId !== null) {
      return Math.ceil(filteredItems.length / itemsPerPage);
    } else {
      return totalPages;
    }
  };

  // Calculate total items count based on current state
  const getTotalItemsCount = () => {
    if (searchQuery.trim() || selectedCategoryId !== null) {
      return filteredItems.length;
    } else {
      return totalItems;
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getDisplayedItemsCount = () => {
    return itemsToDisplay.length;
  };

  const isFiltering = searchQuery.trim() || selectedCategory !== "All";

  const generatePagination = (current: number, total: number) => {
    const pages = [];
    const maxVisiblePages = 7;

    if (total <= maxVisiblePages) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let startPage = Math.max(2, current - 2);
      let endPage = Math.min(total - 1, current + 2);

      if (current <= 4) {
        endPage = 5;
      }

      if (current >= total - 3) {
        startPage = total - 4;
      }

      if (startPage > 2) {
        pages.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < total - 1) {
        pages.push("...");
      }

      pages.push(total);
    }

    return pages;
  };

  const scrollCategories = (direction: "left" | "right") => {
    const container = categoriesContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      const newPosition = direction === "left" 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: newPosition,
        behavior: "smooth"
      });
    }
  };

  const checkScrollButtons = () => {
    const container = categoriesContainerRef.current;
    if (container) {
      setShowLeftScroll(container.scrollLeft > 0);
      setShowRightScroll(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  useEffect(() => {
    const container = categoriesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      checkScrollButtons();
      
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
      };
    }
  }, [categories]);

  return (
    <div className="py-12 bg-gray-50 min-h-screen mt-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8 mt-4">
          <p className="text-xs font-medium tracking-[0.2em] text-gray-500 uppercase mb-2">
            MENU
          </p>
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-gray-900">
            Check Our Tasty Menu
          </h1>
        </div>

        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>

        <div className="mb-12">
          {categoriesLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#d4a574]" />
            </div>
          ) : categoriesError ? (
            <div className="flex justify-center">
              <p className="text-red-500 text-sm">{categoriesError}</p>
            </div>
          ) : (
            <div className="relative w-full">
              {categories.length > 0 && (
                <>
                  {showLeftScroll && (
                    <button
                      onClick={() => scrollCategories("left")}
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 hidden sm:flex items-center justify-center"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  )}
                  {showRightScroll && (
                    <button
                      onClick={() => scrollCategories("right")}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 hidden sm:flex items-center justify-center"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </>
              )}
              <div
                ref={categoriesContainerRef}
                className="grid grid-flow-col auto-cols-max gap-3 md:gap-4 overflow-x-auto scrollbar-hide py-2"
                style={{ 
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
                onScroll={checkScrollButtons}
              >
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.name, category.id)}
                      className={`text-sm md:text-base px-3 md:px-4 py-2 transition-all duration-300 border-b-2 whitespace-nowrap ${
                        selectedCategory === category.name
                          ? "text-[#d4a574] font-semibold border-[#d4a574]"
                          : "text-gray-500 border-transparent hover:text-[#d4a574]"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))
                ) : (
                  <p className="text-red-500 text-sm md:text-base px-4">No categories to display</p>
                )}
              </div>
            </div>
          )}
        </div>

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

        {!isLoading && !error && itemsToDisplay.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">
              No items found matching your criteria.
            </p>
          </div>
        )}

        {!isLoading && !error && itemsToDisplay.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {itemsToDisplay.map((item: MenuItem) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>

            {getDisplayTotalPages() > 1 && (
              <>
                <div className="flex justify-center mt-12">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="border-gray-300 hover:bg-[#d4a574]/10 hover:text-[#d4a574] hover:border-[#d4a574] text-sm md:text-base"
                    >
                      Previous
                    </Button>

                    {generatePagination(currentPage, getDisplayTotalPages()).map((page, index) => (
                      <Button
                        key={index}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => typeof page === "number" ? handlePageChange(page) : null}
                        disabled={page === "..."}
                        className={
                          currentPage === page
                            ? "bg-[#d4a574] hover:bg-[#c9956a] text-white text-sm md:text-base"
                            : page === "..."
                            ? "border-gray-300 cursor-default text-sm md:text-base"
                            : "border-gray-300 hover:bg-[#d4a574]/10 hover:text-[#d4a574] hover:border-[#d4a574] text-sm md:text-base"
                        }
                      >
                        {page}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === getDisplayTotalPages()}
                      className="border-gray-300 hover:bg-[#d4a574]/10 hover:text-[#d4a574] hover:border-[#d4a574] text-sm md:text-base"
                    >
                      Next
                    </Button>
                  </div>
                </div>

                <div className="text-center mt-6">
                  <p className="text-sm text-gray-500">
                    Page {currentPage} of {getDisplayTotalPages()} • Showing{" "}
                    {getDisplayedItemsCount()} of {getTotalItemsCount()} items
                    {searchQuery && ` matching "${searchQuery}"`}
                    {selectedCategory !== "All" && ` in category "${selectedCategory}"`}
                  </p>
                </div>
              </>
            )}

            {getDisplayTotalPages() <= 1 && isFiltering && (
              <div className="text-center mt-6">
                <p className="text-sm text-gray-500">
                  Found {getTotalItemsCount()} items
                  {searchQuery && ` matching "${searchQuery}"`}
                  {selectedCategory !== "All" && ` in category "${selectedCategory}"`}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MenuPage;