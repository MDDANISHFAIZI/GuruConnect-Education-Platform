import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, size = 16, interactive = false, onRatingChange }) => {
  const stars = [1, 2, 3, 4, 5];
  
  return (
    <div className="flex items-center space-x-0.5">
      {stars.map((star) => {
        const isFilled = star <= Math.round(rating);
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            className={`${interactive ? 'hover:scale-110 transition-transform cursor-pointer' : 'cursor-default'}`}
          >
            <Star
              size={size}
              className={`${
                isFilled 
                  ? 'fill-amber-400 text-amber-400' 
                  : 'text-slate-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
