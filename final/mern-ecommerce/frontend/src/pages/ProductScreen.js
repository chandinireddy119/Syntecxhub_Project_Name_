import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaHeart } from 'react-icons/fa';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Rating from '../components/Rating';
import {
  fetchProductDetails,
  createReview,
  clearProductDetails,
  clearReviewState,
} from '../features/products/productSlice';
import { addToCart } from '../features/cart/cartSlice';
import { toggleWishlist } from '../features/wishlist/wishlistSlice';

const ProductScreen = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const { productDetails: product, detailsLoading, error, reviewSuccess, reviewError } =
    useSelector((state) => state.products);
  const { userInfo } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);

  useEffect(() => {
    dispatch(fetchProductDetails(id));
    return () => {
      dispatch(clearProductDetails());
      dispatch(clearReviewState());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (reviewSuccess) {
      toast.success('Review submitted successfully');
      setComment('');
      dispatch(fetchProductDetails(id));
      dispatch(clearReviewState());
    }
    if (reviewError) {
      toast.error(reviewError);
      dispatch(clearReviewState());
    }
  }, [reviewSuccess, reviewError, dispatch, id]);

  if (detailsLoading || !product) {
    return <Loader fullPage />;
  }

  if (error) {
    return (
      <div className="container">
        <Message variant="danger">{error}</Message>
      </div>
    );
  }

  const isWishlisted = wishlistItems.some((item) => item._id === product._id);
  const finalPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        image: product.image,
        price: finalPrice,
        countInStock: product.countInStock,
        qty,
      })
    );
    toast.success(`${product.name} added to cart`);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!userInfo) {
      toast.info('Please sign in to leave a review');
      navigate('/login');
      return;
    }
    dispatch(createReview({ productId: id, review: { rating, comment } }));
  };

  return (
    <div className="container">
      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        <span className="sep">/</span>
        <Link to="/shop">Shop</Link>
        <span className="sep">/</span>
        <span>{product.name}</span>
      </div>

      <div className="product-details">
        <div>
          <div className="product-gallery-main">
            <img src={product.image} alt={product.name} />
          </div>
        </div>

        <div>
          <div className="product-info-category">{product.category} &middot; {product.brand}</div>
          <h1 className="product-info-title">{product.name}</h1>

          <div className="product-info-rating">
            <Rating value={product.rating} numReviews={product.numReviews} />
            <span>{product.numReviews} reviews</span>
          </div>

          <div className="product-info-price">
            {product.discountPrice > 0 && (
              <del style={{ fontSize: '1.1rem', opacity: 0.5, marginRight: 10 }}>
                ${product.price.toFixed(2)}
              </del>
            )}
            ${finalPrice.toFixed(2)}
          </div>

          <p className="product-info-desc">{product.description}</p>

          <div
            className={`product-info-stock ${product.countInStock > 0 ? 'in-stock' : 'out-stock'}`}
          >
            {product.countInStock > 0 ? `In Stock (${product.countInStock} available)` : 'Out of Stock'}
          </div>

          <div className="product-info-actions">
            {product.countInStock > 0 && (
              <div className="qty-selector">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                  &minus;
                </button>
                <span>{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(product.countInStock, q + 1))}
                >
                  +
                </button>
              </div>
            )}
            <button
              type="button"
              className="btn btn-primary btn-lg"
              disabled={product.countInStock === 0}
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
            <button
              type="button"
              className="btn btn-icon btn-outline"
              onClick={() => {
                dispatch(toggleWishlist(product));
                toast.info(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
              }}
              aria-label="Toggle wishlist"
              style={{ color: isWishlisted ? 'var(--clay)' : undefined, borderColor: isWishlisted ? 'var(--clay)' : undefined }}
            >
              <FaHeart />
            </button>
          </div>
        </div>
      </div>

      <div className="product-tabs">
        <button
          type="button"
          className={activeTab === 'description' ? 'active' : ''}
          onClick={() => setActiveTab('description')}
        >
          Description
        </button>
        <button
          type="button"
          className={activeTab === 'reviews' ? 'active' : ''}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews ({product.numReviews})
        </button>
      </div>

      <div style={{ padding: '32px 0', maxWidth: 720 }}>
        {activeTab === 'description' ? (
          <p style={{ color: 'var(--ink-soft)', lineHeight: 1.8 }}>{product.description}</p>
        ) : (
          <div>
            {product.reviews.length === 0 && <p style={{ color: 'var(--ink-soft)' }}>No reviews yet.</p>}
            {product.reviews.map((review) => (
              <div className="review-item" key={review._id}>
                <div className="review-header">
                  <span className="review-author">{review.name}</span>
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <Rating value={review.rating} />
                <p style={{ color: 'var(--ink-soft)', marginTop: 8 }}>{review.comment}</p>
              </div>
            ))}

            <form onSubmit={handleSubmitReview} style={{ marginTop: 32, maxWidth: 480 }}>
              <h3 style={{ marginBottom: 16, fontSize: '1.1rem' }}>Write a Review</h3>
              <div className="form-group">
                <label htmlFor="rating">Rating</label>
                <select
                  id="rating"
                  className="form-control"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Good</option>
                  <option value={3}>3 - Average</option>
                  <option value={2}>2 - Fair</option>
                  <option value={1}>1 - Poor</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="comment">Comment</label>
                <textarea
                  id="comment"
                  className="form-control"
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Submit Review
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductScreen;
