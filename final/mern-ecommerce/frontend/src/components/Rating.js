import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const Rating = ({ value = 0, numReviews }) => {
  return (
    <div className="product-card-rating" aria-label={`Rated ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        if (value >= star) return <FaStar key={star} />;
        if (value >= star - 0.5) return <FaStarHalfAlt key={star} />;
        return <FaRegStar key={star} />;
      })}
      {numReviews !== undefined && <span>({numReviews})</span>}
    </div>
  );
};

export default Rating;
