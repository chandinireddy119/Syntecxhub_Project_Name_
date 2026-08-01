import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Rating from './Rating';
import { addToCart } from '../features/cart/cartSlice';
import { toggleWishlist } from '../features/wishlist/wishlistSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);
  const isWishlisted = wishlistItems.some((item) => item._id === product._id);

  const finalPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (product.countInStock < 1) {
      toast.error('This product is out of stock');
      return;
    }
    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        image: product.image,
        price: finalPrice,
        countInStock: product.countInStock,
        qty: 1,
      })
    );
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    dispatch(toggleWishlist(product));
    toast.info(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <Link to={`/product/${product._id}`} className="product-card">
      <div className="product-card-media">
        <span className="product-card-price-tag">
          ${finalPrice.toFixed(2)}
        </span>
        {product.discountPrice > 0 && <span className="product-card-badge">Sale</span>}
        {product.countInStock === 0 && (
          <span className="product-card-badge" style={{ background: 'var(--ink-soft)' }}>
            Sold Out
          </span>
        )}
        <img src={product.image} alt={product.name} loading="lazy" />
        <button
          type="button"
          className={`product-card-wishlist ${isWishlisted ? 'active' : ''}`}
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
        >
          <FaHeart />
        </button>
        <button type="button" className="product-card-quickadd" onClick={handleQuickAdd}>
          <FaShoppingCart style={{ marginRight: 6 }} />
          Quick Add
        </button>
      </div>
      <div className="product-card-body">
        <span className="product-card-category">{product.category}</span>
        <h3 className="product-card-title">{product.name}</h3>
        <Rating value={product.rating} numReviews={product.numReviews} />
        <div className="product-card-footer">
          <span className="product-card-price">
            {product.discountPrice > 0 && <del>${product.price.toFixed(2)}</del>}
            ${finalPrice.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
