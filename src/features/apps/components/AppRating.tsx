import React from 'react';
import { Star } from 'lucide-react';

interface AppRatingProps {
  app?: {
    average_rating?: number | string;
    rating_count?: number | string;
  };
}

const AppRating: React.FC<AppRatingProps> = ({ app }) => {
  const value = Number(app?.average_rating) || 0;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          fill={star <= value ? '#F59E0B' : 'none'}
          color={star <= value ? '#F59E0B' : '#6B7280'}
        />
      ))}
      <span className="text-base ml-1">({app?.rating_count})</span>
    </div>
  );
};

export default AppRating;
