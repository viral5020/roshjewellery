import React from "react";
import { Card } from "@/components/ui/card"; // Assuming you have a card component for individual items

function CategoryTile({ category }) {
  return (
    <Card className="p-6 bg-white shadow-lg rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
      <div className="relative overflow-hidden rounded-md mb-4">
        {/* Image with smooth hover effect */}
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-48 object-cover transition-all duration-300 transform hover:scale-110"
        />
        {/* Overlay with category name */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white opacity-0 hover:opacity-100 transition-opacity duration-300">
          <h3 className="text-2xl font-semibold">{category.name}</h3>
        </div>
      </div>
      {/* Description or extra text below */}
      <p className="text-gray-700 text-sm mt-2">{category.description}</p>
    </Card>
  );
}

export default CategoryTile;
