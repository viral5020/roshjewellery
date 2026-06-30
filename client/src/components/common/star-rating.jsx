import { StarIcon } from "lucide-react";
import { Button } from "../ui/button";

function StarRatingComponent({ rating, handleRatingChange }) {
  console.log(rating, "rating");

  return [1, 2, 3, 4, 5].map((star, index) => (
    <Button
      key={index}
      className={`p-1 rounded-full transition-colors border-none bg-transparent shadow-none w-8 h-8 ${
        star <= rating
          ? "text-yellow-500 hover:bg-rosh-primary/5"
          : "text-rosh-primary/20 hover:bg-rosh-primary/5 hover:text-rosh-primary"
      }`}
      variant="outline"
      size="icon"
      onClick={handleRatingChange ? () => handleRatingChange(star) : null}
    >
      <StarIcon
        className={`w-5 h-5 ${
          star <= rating ? "fill-yellow-500 text-yellow-500" : "fill-transparent text-rosh-primary/30"
        }`}
      />
    </Button>
  ));
}

export default StarRatingComponent;
