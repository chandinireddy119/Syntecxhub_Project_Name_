import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaHeart } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';

const WishlistScreen = () => {
  const { wishlistItems } = useSelector((state) => state.wishlist);

  return (
    <div className="container">
      <h1 style={{ padding: '32px 0 24px', fontSize: '1.8rem' }}>My Wishlist</h1>

      {wishlistItems.length === 0 ? (
        <div className="wishlist-empty">
          <FaHeart size={48} color="var(--mist-dark)" />
          <h3 style={{ margin: '16px 0 8px' }}>Your wishlist is empty</h3>
          <p style={{ color: 'var(--ink-soft)', marginBottom: 20 }}>
            Save items you love so you can find them later.
          </p>
          <Link to="/shop" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid" style={{ paddingBottom: 48 }}>
          {wishlistItems.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistScreen;
