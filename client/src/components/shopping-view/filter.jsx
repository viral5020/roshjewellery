import { filterOptions } from "@/config";
import { Fragment, useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

function ProductFilter({ filters, handleFilter, selectedCategory }) {
  const [allCategories, setAllCategories] = useState([]);
  const [allSubcategories, setAllSubcategories] = useState([]);

  useEffect(() => {
    // Fetch all categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setAllCategories(data.categories || []);
      })
      .catch(err => console.error('Error fetching categories:', err));

    // Fetch all subcategories
    fetch('/api/subcategories')
      .then(res => res.json())
      .then(data => {
        setAllSubcategories(data.subCategories || []);
      })
      .catch(err => console.error('Error fetching subcategories:', err));
  }, []);

  // Compute subcategories to display based on selectedCategory or checked category filters
  let displayedSubcategories = [];

  if (selectedCategory) {
    // We are on a category page (e.g., /shop/Men or /shop/Women)
    const activeCategory = allCategories.find(
      cat => cat.name.toLowerCase() === selectedCategory.toLowerCase()
    );
    if (activeCategory) {
      displayedSubcategories = allSubcategories.filter(sub => {
        const subCatId = sub.category?._id ? String(sub.category._id) : String(sub.category);
        return subCatId === String(activeCategory._id);
      });
    }
  } else {
    // We are on /shop/listing (Complete Collection)
    const activeCategoryNames = filters?.category || [];
    if (activeCategoryNames.length > 0) {
      // Show only subcategories of checked categories
      const activeCategoryIds = allCategories
        .filter(cat => activeCategoryNames.some(name => name.toLowerCase() === cat.name.toLowerCase()))
        .map(cat => String(cat._id));

      displayedSubcategories = allSubcategories.filter(sub => {
        const subCatId = sub.category?._id ? String(sub.category._id) : String(sub.category);
        return activeCategoryIds.includes(subCatId);
      });
    } else {
      // Show all subcategories if no category filter is checked
      displayedSubcategories = allSubcategories;
    }
  }

  // Group displayed subcategories by name to show unique names (case-insensitive)
  const uniqueSubcategories = [];
  const seenNames = new Set();
  
  for (const sub of displayedSubcategories) {
    const normName = sub.name.toLowerCase() === "earings" ? "earrings" : sub.name.toLowerCase();
    if (!seenNames.has(normName)) {
      seenNames.add(normName);
      uniqueSubcategories.push(sub);
    }
  }

  const isSubcategoryChecked = (subName) => {
    if (!filters || !filters.subcategories || filters.subcategories.length === 0) return false;
    
    // Find all IDs with this name
    const matchingIds = allSubcategories
      .filter(s => s.name.toLowerCase() === subName.toLowerCase() || 
                   (subName.toLowerCase() === "earrings" && s.name.toLowerCase() === "earings"))
      .map(s => String(s._id));
      
    return filters.subcategories.some(val => 
      matchingIds.includes(String(val)) || String(val).toLowerCase() === subName.toLowerCase()
    );
  };

  const handleSubcategoryToggle = (subcategory) => {
    const isChecked = isSubcategoryChecked(subcategory.name);
    // Find all IDs with this name
    const matchingIds = allSubcategories
      .filter(s => s.name.toLowerCase() === subcategory.name.toLowerCase() || 
                   (subcategory.name.toLowerCase() === "earrings" && s.name.toLowerCase() === "earings"))
      .map(s => String(s._id));
      
    if (isChecked) {
      // Find the active ID currently in filters.subcategories and remove it
      const activeId = filters.subcategories.find(val => 
        matchingIds.includes(String(val)) || String(val).toLowerCase() === subcategory.name.toLowerCase()
      );
      if (activeId) {
        handleFilter('subcategories', activeId);
      }
    } else {
      handleFilter('subcategories', subcategory._id);
    }
  };

  return (
    <div className="bg-transparent pt-4 px-2">
      <div className="pb-6 border-b border-rosh-primary/10 mb-8 overflow-visible">
        <h2 className="font-serif text-[32px] md:text-[40px] italic text-rosh-primary leading-normal tracking-wide pl-2 py-2">Refine</h2>
      </div>
      <div className="space-y-8 pl-1 pr-4 pb-4">
        {/* Main Categories (Men / Women) for Collection Page */}
        {!selectedCategory && (
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium text-rosh-primary mb-4">Category</h3>
            <div className="grid gap-3">
              {[
                { id: "Men", label: "Men" },
                { id: "Women", label: "Women" },
              ].map((option) => (
                <Label key={option.id} className="flex items-center gap-3 font-light text-sm text-rosh-primary/70 hover:text-rosh-primary cursor-pointer group transition-colors py-1">
                  <Checkbox
                    checked={
                      filters &&
                      filters.category &&
                      filters.category.indexOf(option.id) > -1
                    }
                    onCheckedChange={() => handleFilter('category', option.id)}
                    className="border-rosh-primary/30 text-rosh-background data-[state=checked]:bg-rosh-primary data-[state=checked]:border-rosh-primary shrink-0"
                  />
                  <span className="group-hover:translate-x-1 transition-transform duration-300 flex-1 break-words leading-normal">{option.label}</span>
                </Label>
              ))}
            </div>
          </div>
        )}

        {!selectedCategory && <div className="w-full h-[1px] bg-rosh-primary/10 my-8"></div>}

        {/* Subcategories (Collections) */}
        {uniqueSubcategories.length > 0 && (
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium text-rosh-primary mb-4">
              {selectedCategory ? "Category" : "Collections"}
            </h3>
            <div className="grid gap-3">
              {uniqueSubcategories.map((subcategory) => (
                <Label key={subcategory._id} className="flex items-center gap-3 font-light text-sm text-rosh-primary/70 hover:text-rosh-primary cursor-pointer group transition-colors py-1">
                  <Checkbox
                    checked={isSubcategoryChecked(subcategory.name)}
                    onCheckedChange={() => handleSubcategoryToggle(subcategory)}
                    className="border-rosh-primary/30 text-rosh-background data-[state=checked]:bg-rosh-primary data-[state=checked]:border-rosh-primary shrink-0"
                  />
                  <span className="group-hover:translate-x-1 transition-transform duration-300 flex-1 break-words leading-normal">
                    {subcategory.name.toLowerCase() === "earings" ? "Earrings" : subcategory.name}
                  </span>
                </Label>
              ))}
            </div>
          </div>
        )}

        {uniqueSubcategories.length > 0 && <div className="w-full h-[1px] bg-rosh-primary/10 my-8"></div>}

        {/* Metal Type Filter */}
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium text-rosh-primary mb-4">Metal Type</h3>
          <div className="grid gap-3">
            {[
              { id: "gold", label: "Gold" },
              { id: "silver", label: "Silver" },
            ].map((option) => (
              <Label key={option.id} className="flex items-center gap-3 font-light text-sm text-rosh-primary/70 hover:text-rosh-primary cursor-pointer group transition-colors py-1">
                <Checkbox
                  checked={
                    filters &&
                    filters.metalType &&
                    filters.metalType.indexOf(option.id) > -1
                  }
                  onCheckedChange={() => handleFilter('metalType', option.id)}
                  className="border-rosh-primary/30 text-rosh-background data-[state=checked]:bg-rosh-primary data-[state=checked]:border-rosh-primary shrink-0"
                />
                <span className="group-hover:translate-x-1 transition-transform duration-300 flex-1 break-words leading-normal">{option.label}</span>
              </Label>
            ))}
          </div>
        </div>

        <div className="w-full h-[1px] bg-rosh-primary/10 my-8"></div>

        {/* Diamond Type Filter */}
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium text-rosh-primary mb-4">Diamond</h3>
          <div className="grid gap-3">
            {[
              { id: "lab-grown", label: "Lab Grown" },
              { id: "natural", label: "Natural" },
              { id: "without-diamond", label: "Without Diamond" },
            ].map((option) => (
              <Label key={option.id} className="flex items-center gap-3 font-light text-sm text-rosh-primary/70 hover:text-rosh-primary cursor-pointer group transition-colors py-1">
                <Checkbox
                  checked={
                    filters &&
                    filters.diamondType &&
                    filters.diamondType.indexOf(option.id) > -1
                  }
                  onCheckedChange={() => handleFilter('diamondType', option.id)}
                  className="border-rosh-primary/30 text-rosh-background data-[state=checked]:bg-rosh-primary data-[state=checked]:border-rosh-primary shrink-0"
                />
                <span className="group-hover:translate-x-1 transition-transform duration-300 flex-1 break-words leading-normal">{option.label}</span>
              </Label>
            ))}
          </div>
        </div>

        <div className="w-full h-[1px] bg-rosh-primary/10 my-8"></div>

        {/* Color Filter */}
        {(() => {
          const activeMetals = filters?.metalType || [];
          const hasGold   = activeMetals.includes("gold");
          const hasSilver = activeMetals.includes("silver");
          if (!hasGold && !hasSilver) return null;

          const goldColorOptions = [
            { id: "rose-gold",   label: "Rose Gold" },
            { id: "white-gold",  label: "White Gold" },
            { id: "yellow-gold", label: "Yellow Gold" },
          ];
          const silverColorOptions = [
            { id: "silver-polished",    label: "Silver Polished" },
            { id: "yellow-polished",    label: "Yellow Polished" },
            { id: "rose-gold-polished", label: "Rose Gold Polished" },
          ];

          const COLOR_SWATCHES = {
            "rose-gold":          "linear-gradient(135deg,#e8b4a0,#d4956b)",
            "white-gold":         "linear-gradient(135deg,#f0f0f0,#c8c8c8)",
            "yellow-gold":        "linear-gradient(135deg,#ffd700,#c8a600)",
            "silver-polished":    "linear-gradient(135deg,#e8e8e8,#a8a8a8)",
            "yellow-polished":    "linear-gradient(135deg,#ffe066,#b8960c)",
            "rose-gold-polished": "linear-gradient(135deg,#f0c0a0,#c07840)",
          };

          const colorOptions = [
            ...(hasGold   ? goldColorOptions   : []),
            ...(hasSilver ? silverColorOptions : []),
          ];

          return (
            <div className="mb-8">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium text-rosh-primary mb-4">Finish</h3>
              <div className="grid gap-3">
                {colorOptions.map((option) => {
                  const isChecked = filters?.colors && filters.colors.indexOf(option.id) > -1;
                  return (
                    <Label key={option.id} className="flex items-center gap-3 font-light text-sm text-rosh-primary/70 hover:text-rosh-primary cursor-pointer group transition-colors py-1">
                      <Checkbox
                        checked={!!isChecked}
                        onCheckedChange={() => handleFilter('colors', option.id)}
                        className="border-rosh-primary/30 text-rosh-background data-[state=checked]:bg-rosh-primary data-[state=checked]:border-rosh-primary shrink-0"
                      />
                      <span
                        className="inline-block w-3.5 h-3.5 rounded-full shadow-[0_0_0_1px_rgba(48,28,38,0.1)] shrink-0"
                        style={{ background: COLOR_SWATCHES[option.id] ?? "#ccc" }}
                      />
                      <span className="group-hover:translate-x-1 transition-transform duration-300 flex-1 break-words leading-normal">{option.label}</span>
                    </Label>
                  );
                })}
              </div>
              <div className="w-full h-[1px] bg-rosh-primary/10 my-8"></div>
            </div>
          );
        })()}

        {/* Price Slider */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium text-rosh-primary">Price</h3>
            <span className="text-[10px] font-medium text-rosh-primary tracking-widest uppercase">
              {filters && filters.price && filters.price[1] > 0 && filters.price[1] < 100000 ? `Up to ₹${filters.price[1]}` : "Any"}
            </span>
          </div>
          <div className="mt-2 px-2">
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={filters && filters.price ? filters.price[1] : 100000}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                handleFilter('price', [0, val]);
              }}
              className="w-full h-[2px] bg-rosh-primary/20 rounded-lg appearance-none cursor-pointer accent-rosh-primary"
            />
            <div className="flex justify-between text-[10px] text-rosh-primary/50 mt-3 font-light tracking-widest -mx-2">
              <span>₹0</span>
              <span>₹100,000+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductFilter;
